import { useEffect, useRef, useState } from 'react';
import { api } from '../api';

/**
 * Composant pour enregistrer de l'audio ou de la vidéo
 * Utilise l'API MediaRecorder du navigateur
 */
export default function Recorder({ onUploaded }) {
  const [recordingType, setRecordingType] = useState('audio'); // 'audio' ou 'video'
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  /**
   * Démarre l'enregistrement audio ou vidéo
   */
  const startRecording = async () => {
    setError('');
    try {
      // Définit les contraintes selon le type d'enregistrement
      const constraints =
        recordingType === 'audio'
          ? { audio: true }
          : { audio: true, video: { facingMode: 'user' } };

      // Demande l'accès au micro/caméra
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Affiche le flux vidéo dans la balise video si c'est une vidéo
      if (videoRef.current && recordingType === 'video') {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Crée le MediaRecorder avec le stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: recordingType === 'audio' ? 'audio/webm' : 'video/webm',
      });

      chunksRef.current = [];

      // Événement déclenché quand des données sont disponibles
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      // Événement déclenché quand l'enregistrement s'arrête
      mediaRecorder.onstop = () => {
        // Arrête tous les tracks du stream
        stream.getTracks().forEach((track) => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        // Upload le fichier
        handleUpload();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', err);
      setError(
        "Impossible d'accéder au micro/caméra. Vérifiez les permissions de votre navigateur."
      );
    }
  };

  /**
   * Arrête l'enregistrement
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  /**
   * Upload le fichier enregistré vers le backend
   */
  const handleUpload = async () => {
    setUploading(true);
    setError('');

    try {
      // Crée un Blob à partir des chunks enregistrés
      const blob = new Blob(chunksRef.current, {
        type: recordingType === 'audio' ? 'audio/webm' : 'video/webm',
      });

      // Prépare le FormData pour l'envoi
      const formData = new FormData();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename =
        recordingType === 'audio'
          ? `audio-${timestamp}.webm`
          : `video-${timestamp}.webm`;

      formData.append('file', blob, filename);
      formData.append('recording_type', recordingType);
      formData.append('title', filename);

      // Envoie le fichier au backend
      const res = await api.post('/recordings/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Notifie le composant parent que l'upload est terminé
      if (onUploaded) {
        onUploaded(res.data);
      }
    } catch (err) {
      console.error('Erreur lors de l\'upload:', err);
      setError(
        err.response?.data?.detail ||
        'Erreur lors de l\'envoi du fichier. Réessayez.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <select
          className="bg-slate-900 border border-slate-700 text-sm rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={recordingType}
          onChange={(e) => setRecordingType(e.target.value)}
          disabled={isRecording}
        >
          <option value="audio">Audio</option>
          <option value="video">Vidéo</option>
        </select>
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white text-sm font-medium transition-colors"
          >
            🎤 Démarrer l'enregistrement
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white text-sm font-medium transition-colors"
          >
            ⏹️ Arrêter
          </button>
        )}
      </div>
      {recordingType === 'video' && (
        <div className="mt-2">
          <video
            ref={videoRef}
            className="w-full h-48 bg-black rounded border border-slate-700 object-cover"
            muted
            playsInline
          />
        </div>
      )}
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <span className="animate-pulse">●</span>
          <span>Enregistrement en cours...</span>
        </div>
      )}
      {uploading && (
        <div className="text-sm text-indigo-400">Upload en cours...</div>
      )}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

