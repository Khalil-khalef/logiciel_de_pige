import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecordings, getSettings, updateSettings } from '../api';

export default function SilenceDetection() {
  const [recordings, setRecordings] = useState([]);
  const [settings, setSettings] = useState({
    vad_sensitivity: 2,
    silence_threshold_seconds: 5.0,
    email_alerts_enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recordingsData, settingsData] = await Promise.all([
        getRecordings(),
        getSettings(),
      ]);
      setRecordings((recordingsData.results || recordingsData).filter(r => r.flagged || r.vad_report));
      setSettings({
        vad_sensitivity: settingsData.vad_sensitivity || 2,
        silence_threshold_seconds: settingsData.silence_threshold_seconds || 5.0,
        email_alerts_enabled: settingsData.email_alerts_enabled || false,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      await updateSettings(settings);
      setMessage('Paramètres sauvegardés !');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Détection de Silence</h1>
          <p className="text-slate-400">Analysez et configurez la détection des silences (VAD)</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-8 p-4 rounded-lg border ${
            message.includes('succès') || message.includes('sauvegardés')
              ? 'bg-green-900/30 border-green-700 text-green-300' 
              : 'bg-red-900/30 border-red-700 text-red-300'
          }`}>
            {message.includes('succès') || message.includes('sauvegardés') ? '✅' : '⚠️'} {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-6 rounded-xl sticky top-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                ⚙️ Configuration VAD
              </h2>
              
              <div className="space-y-6">
                {/* Sensitivity */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Sensibilité
                  </label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((val) => (
                      <button
                        key={val}
                        onClick={() => setSettings({ ...settings, vad_sensitivity: val })}
                        className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                          settings.vad_sensitivity === val
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    0 = peu sensible | 3 = très sensible
                  </p>
                </div>

                {/* Threshold */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Seuil de silence (s)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.silence_threshold_seconds}
                    onChange={(e) => setSettings({ ...settings, silence_threshold_seconds: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Durée minimale pour signaler comme anomalie
                  </p>
                </div>

                {/* Email Alerts */}
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.email_alerts_enabled}
                      onChange={(e) => setSettings({ ...settings, email_alerts_enabled: e.target.checked })}
                      className="w-5 h-5 rounded bg-slate-900 border border-slate-600 cursor-pointer"
                    />
                    <span className="text-sm text-white font-medium">Alertes email</span>
                  </label>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-indigo-800 disabled:to-indigo-800 rounded-lg text-white font-semibold transition-all shadow-lg"
                >
                  {saving ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
                </button>
              </div>
            </div>
          </div>

          {/* Recordings List */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                🔇 Enregistrements avec silences ({recordings.length})
              </h2>
              
              {recordings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">✨</div>
                  <p className="text-slate-400 text-lg">Aucun problème détecté!</p>
                  <p className="text-slate-500 text-sm mt-2">Tous vos enregistrements passent les tests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recordings.map((recording) => (
                    <Link
                      key={recording.id}
                      to={`/recordings/${recording.id}`}
                      className="block p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-all hover:shadow-lg border border-slate-600/50 hover:border-red-600/50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {recording.flagged && <span className="text-red-400">⚠️</span>}
                            <h3 className="text-white font-semibold">
                              {recording.title || 'Sans titre'}
                            </h3>
                          </div>
                          <div className="text-slate-400 text-sm mb-3">
                            <span className="inline-block px-2 py-1 bg-slate-600 rounded mr-2 text-xs">
                              {recording.type}
                            </span>
                            <span>{formatDuration(recording.duration_seconds)}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(recording.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>

                          {recording.vad_report && (
                            <div className="bg-slate-900/50 p-3 rounded text-xs space-y-1">
                              <div className="flex justify-between text-slate-300">
                                <span>Silence détecté:</span>
                                <span className="text-yellow-400 font-semibold">{recording.vad_report.silence_percentage}%</span>
                              </div>
                              {recording.vad_report.unnatural_silences && recording.vad_report.unnatural_silences.length > 0 && (
                                <div className="text-red-400 font-semibold">
                                  {recording.vad_report.unnatural_silences.length} anomalie(s) détectée(s)
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-indigo-400 text-lg">→</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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

