import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecording, processRecording, trimRecording, downloadRecording } from '../api';
import TrimModal from '../components/TrimModal';

export default function RecordingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recording, setRecording] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrimModal, setShowTrimModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRecording();
  }, [id]);

  const loadRecording = async () => {
    try {
      setLoading(true);
      const data = await getRecording(id);
      setRecording(data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        navigate('/recordings', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    try {
      setProcessing(true);
      await processRecording(id);
      alert('Traitement relancé. Les résultats seront mis à jour sous peu.');
      setTimeout(() => loadRecording(), 5000);
    } catch (err) {
      alert('Erreur lors du traitement');
    } finally {
      setProcessing(false);
    }
  };

  const handleTrim = async (startTime, endTime) => {
    try {
      await trimRecording(id, startTime, endTime);
      alert('Découpage en cours de traitement. Le fichier sera mis à jour.');
      setShowTrimModal(false);
      setTimeout(() => loadRecording(), 5000);
    } catch (err) {
      alert('Erreur lors du découpage');
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await downloadRecording(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recording.title || 'recording'}.${recording.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Erreur lors du téléchargement');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-lg">Chargement...</div>
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-red-400 text-lg">Enregistrement introuvable</div>
      </div>
    );
  }

  const fileUrl = recording.file_url || `http://localhost:8000${recording.file}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link 
          to="/recordings" 
          className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-medium mb-8 transition-colors"
        >
          ← Retour à la liste
        </Link>

        {/* Main Card */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden shadow-xl">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 border-b border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {recording.title || 'Sans titre'}
                </h1>
                <div className="flex items-center gap-4 text-slate-400 text-sm">
                  <span className="px-3 py-1 bg-slate-700 rounded-full">
                    {recording.type === 'antenne' && '📻'}
                    {recording.type === 'emission' && '📺'}
                    {recording.type === 'reunion' && '👥'}
                    {' '}{recording.type}
                  </span>
                  <span>⏱️ {formatDuration(recording.duration_seconds)}</span>
                  <span>📅 {new Date(recording.created_at).toLocaleString('fr-FR')}</span>
                </div>
              </div>
              {recording.flagged && (
                <div className="flex-shrink-0">
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-center">
                    <div className="text-3xl mb-1">⚠️</div>
                    <div className="text-red-300 text-xs font-semibold">Marqué</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Audio Player */}
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">Lecteur audio</h2>
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <audio controls className="w-full">
                <source src={fileUrl} type={`audio/${recording.format}`} />
                Votre navigateur ne supporte pas l'élément audio.
              </audio>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => setShowTrimModal(true)}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                ✂️ Découper
              </button>
              <button
                onClick={handleProcess}
                disabled={processing}
                className="px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-green-800 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                🔄 {processing ? 'Traitement...' : 'Relancer'}
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                ⬇️ Télécharger
              </button>
              <Link
                to="/recordings"
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                ← Retour
              </Link>
            </div>
          </div>

          {/* VAD Report */}
          {recording.vad_report && Object.keys(recording.vad_report).length > 0 && (
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">📊 Rapport de détection de silence (VAD)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Silence total</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {recording.vad_report.total_silence_seconds?.toFixed(2)}s
                  </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Pourcentage</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {recording.vad_report.silence_percentage}%
                  </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Segments de voix</div>
                  <div className="text-2xl font-bold text-green-400">
                    {recording.vad_report.voice_segments_count || 0}
                  </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Segments de silence</div>
                  <div className="text-2xl font-bold text-orange-400">
                    {recording.vad_report.silence_segments_count || 0}
                  </div>
                </div>
              </div>

              {recording.vad_report.unnatural_silences && recording.vad_report.unnatural_silences.length > 0 && (
                <div className="mt-4 bg-red-900/20 border border-red-700 p-4 rounded-lg">
                  <h3 className="text-red-400 font-semibold mb-3">⚠️ Blancs non naturels détectés</h3>
                  <div className="space-y-2">
                    {recording.vad_report.unnatural_silences.map((silence, idx) => (
                      <div key={idx} className="text-sm text-red-300 bg-red-900/20 p-2 rounded flex justify-between">
                        <span>{silence.start?.toFixed(2)}s - {silence.end?.toFixed(2)}s</span>
                        <span>({silence.duration?.toFixed(2)}s)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* File Info */}
          <div className="p-6 bg-slate-900/30">
            <h2 className="text-lg font-semibold text-white mb-4">📋 Informations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Format:</span>
                <span className="text-white font-medium">{recording.format?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Taille:</span>
                <span className="text-white font-medium">{formatFileSize(recording.file_size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Créé:</span>
                <span className="text-white font-medium">{new Date(recording.created_at).toLocaleString('fr-FR')}</span>
              </div>
              {recording.custom_name && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Nom personnalisé:</span>
                  <span className="text-white font-medium">{recording.custom_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trim Modal */}
        {showTrimModal && (
          <TrimModal
            duration={recording.duration_seconds}
            onClose={() => setShowTrimModal(false)}
            onTrim={handleTrim}
          />
        )}
      </div>
    </div>
  );
}

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

