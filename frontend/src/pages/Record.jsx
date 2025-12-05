import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadRecording } from '../api';
import AudioLevelMeter from '../components/AudioLevelMeter';

export default function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState('antenne');
  const [format, setFormat] = useState('webm');
  const [quality, setQuality] = useState('high');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = format === 'webm' ? 'audio/webm' : `audio/${format}`;
      const options = {
        mimeType,
        audioBitsPerSecond: quality === 'high' ? 128000 : quality === 'medium' ? 64000 : 32000,
      };

      const mediaRecorder = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        await handleUpload();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError('');

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch (err) {
      setError("Impossible d'accéder au microphone");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      const blob = new Blob(chunksRef.current, { type: `audio/${format}` });
      const file = new File([blob], `recording-${Date.now()}.${format}`, { type: `audio/${format}` });

      await uploadRecording(file, {
        type: recordingType,
        format,
        title: `Enregistrement ${recordingType} - ${new Date().toLocaleString()}`,
      });

      navigate('/recordings');
    } catch (err) {
      setError('Erreur lors de l\'upload');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Nouvel enregistrement</h1>
          <p className="text-slate-400">Configurez et démarrez votre enregistrement audio</p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-8 rounded-xl space-y-6">
          {/* Recording Type */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Type d'enregistrement
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['antenne', 'emission', 'reunion'].map((type) => (
                <button
                  key={type}
                  onClick={() => setRecordingType(type)}
                  disabled={isRecording}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    recordingType === type
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {type === 'antenne' && '📻 Antenne'}
                  {type === 'emission' && '📺 Émission'}
                  {type === 'reunion' && '👥 Réunion'}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Format audio
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'webm', label: 'WebM' },
                { value: 'mp3', label: 'MP3' },
                { value: 'wav', label: 'WAV' },
                { value: 'ogg', label: 'OGG' },
              ].map((fmt) => (
                <button
                  key={fmt.value}
                  onClick={() => setFormat(fmt.value)}
                  disabled={isRecording}
                  className={`py-2 px-4 rounded-lg font-medium transition-all ${
                    format === fmt.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Qualité audio
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'high', label: 'Haute', desc: '128 kbps' },
                { value: 'medium', label: 'Moyenne', desc: '64 kbps' },
                { value: 'low', label: 'Basse', desc: '32 kbps' },
              ].map((q) => (
                <button
                  key={q.value}
                  onClick={() => setQuality(q.value)}
                  disabled={isRecording}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    quality === q.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div>{q.label}</div>
                  <div className="text-xs opacity-75">{q.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recording Timer */}
          {isRecording && (
            <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="text-red-400 font-semibold">Enregistrement en cours</div>
                  <div className="text-red-300 text-lg font-mono">{formatTime(recordingTime)}</div>
                </div>
              </div>
              {streamRef.current && <AudioLevelMeter stream={streamRef.current} />}
            </div>
          )}

          {/* Recording Controls */}
          <div className="flex gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={uploading}
                className="flex-1 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg text-white font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                🎤 Démarrer l'enregistrement
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 py-4 bg-red-600 hover:bg-red-500 rounded-lg text-white font-bold text-lg transition-all shadow-lg"
              >
                ⏹️ Arrêter
              </button>
            )}
          </div>

          {uploading && (
            <div className="bg-indigo-900/20 border border-indigo-700 p-4 rounded-lg text-indigo-300 text-center font-medium">
              📤 Upload en cours...
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Info */}
          <div className="bg-slate-700/50 p-4 rounded-lg text-sm text-slate-300 space-y-2">
            <p>💡 <strong>Conseil:</strong> Assurez-vous d'avoir un microphone connecté.</p>
            <p>🔇 <strong>Détection de silence:</strong> Les enregistrements sont analysés automatiquement.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

