import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../api';

export default function Settings() {
  const [settings, setSettings] = useState({
    storage_path: 'recordings/',
    default_format: 'mp3',
    default_quality: 'high',
    default_sample_rate: 44100,
    default_channels: 2,
    auto_split_enabled: false,
    auto_split_duration_minutes: 60,
    retention_days: 30,
    naming_template: '{type}-{date}-{time}',
    vad_sensitivity: 2,
    silence_threshold_seconds: 5.0,
    email_alerts_enabled: false,
    email_host: '',
    email_port: 587,
    email_user: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      if (data && Object.keys(data).length > 0) {
        setSettings({ ...settings, ...data });
      }
    } catch (err) {
      console.error('Erreur lors du chargement des paramètres:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
    setMessage('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      await updateSettings(settings);
      setMessage('Paramètres sauvegardés avec succès !');
      setTimeout(() => setMessage(''), 3000);
      await loadSettings();
    } catch (err) {
      setMessage('Erreur lors de la sauvegarde');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-lg">Chargement des paramètres...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: '⚙️ Général', icon: '⚙️' },
    { id: 'recording', label: '📻 Enregistrement', icon: '📻' },
    { id: 'vad', label: '🔇 VAD', icon: '🔇' },
    { id: 'email', label: '📧 Email', icon: '📧' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Paramètres</h1>
          <p className="text-slate-400">Personnalisez votre expérience audio</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-8 p-4 rounded-lg border ${
            message.includes('succès')
              ? 'bg-green-900/30 border-green-700 text-green-300'
              : 'bg-red-900/30 border-red-700 text-red-300'
          }`}>
            {message.includes('succès') ? '✅' : '⚠️'} {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl mb-6 p-1 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <span className="hidden md:inline">{tab.label}</span>
              <span className="md:hidden">{tab.icon}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-8 rounded-xl space-y-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Stockage</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Chemin de stockage
                    </label>
                    <input
                      type="text"
                      value={settings.storage_path}
                      onChange={(e) => handleChange('storage_path', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4">Rétention</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Durée de rétention (jours)
                    </label>
                    <input
                      type="number"
                      value={settings.retention_days}
                      onChange={(e) => handleChange('retention_days', parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4">Nommage</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Template de nommage
                    </label>
                    <input
                      type="text"
                      value={settings.naming_template}
                      onChange={(e) => handleChange('naming_template', e.target.value)}
                      placeholder="{type}-{date}-{time}"
                      className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      Variables: {'{type}, {date}, {time}, {timestamp}, {jour}, {mois}, {heure}, {minutes}'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recording Tab */}
          {activeTab === 'recording' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Configuration d'enregistrement</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Format par défaut
                  </label>
                  <select
                    value={settings.default_format}
                    onChange={(e) => handleChange('default_format', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="mp3">MP3</option>
                    <option value="wav">WAV</option>
                    <option value="ogg">OGG</option>
                    <option value="flac">FLAC</option>
                    <option value="webm">WebM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Qualité par défaut
                  </label>
                  <select
                    value={settings.default_quality}
                    onChange={(e) => handleChange('default_quality', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="high">Haute (128 kbps)</option>
                    <option value="medium">Moyenne (64 kbps)</option>
                    <option value="low">Basse (32 kbps)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Sample Rate (Hz)
                  </label>
                  <input
                    type="number"
                    value={settings.default_sample_rate}
                    onChange={(e) => handleChange('default_sample_rate', parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Canaux audio
                  </label>
                  <select
                    value={settings.default_channels}
                    onChange={(e) => handleChange('default_channels', parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1">Mono</option>
                    <option value="2">Stéréo</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.auto_split_enabled}
                    onChange={(e) => handleChange('auto_split_enabled', e.target.checked)}
                    className="w-5 h-5 rounded bg-slate-900 border border-slate-600 cursor-pointer"
                  />
                  <span className="text-white font-medium">Découpage automatique</span>
                </label>
              </div>

              {settings.auto_split_enabled && (
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Découper après (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.auto_split_duration_minutes}
                    onChange={(e) => handleChange('auto_split_duration_minutes', parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* VAD Tab */}
          {activeTab === 'vad' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Détection de voix (VAD)</h2>

              <div className="bg-slate-700/50 p-4 rounded-lg mb-6">
                <p className="text-slate-300 text-sm">
                  La détection de voix (Voice Activity Detection) identifie les silences anormaux dans vos enregistrements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Sensibilité (0-3)
                  </label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((val) => (
                      <button
                        key={val}
                        onClick={() => handleChange('vad_sensitivity', val)}
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
                  <p className="text-xs text-slate-400 mt-2">0 = peu sensible | 3 = très sensible</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Seuil minimal (secondes)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.silence_threshold_seconds}
                    onChange={(e) => handleChange('silence_threshold_seconds', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-slate-400 mt-2">Durée minimale pour signaler une anomalie</p>
                </div>
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Alertes Email</h2>

              <div className="bg-slate-700/50 p-4 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email_alerts_enabled}
                    onChange={(e) => handleChange('email_alerts_enabled', e.target.checked)}
                    className="w-5 h-5 rounded bg-slate-900 border border-slate-600 cursor-pointer"
                  />
                  <span className="text-white font-medium">Activer les alertes email</span>
                </label>
              </div>

              {settings.email_alerts_enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Serveur SMTP
                    </label>
                    <input
                      type="text"
                      value={settings.email_host}
                      onChange={(e) => handleChange('email_host', e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Port
                    </label>
                    <input
                      type="number"
                      value={settings.email_port}
                      onChange={(e) => handleChange('email_port', parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Utilisateur / Email
                    </label>
                    <input
                      type="text"
                      value={settings.email_user}
                      onChange={(e) => handleChange('email_user', e.target.value)}
                      placeholder="user@gmail.com"
                      className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      value={settings.email_password || ''}
                      onChange={(e) => handleChange('email_password', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-indigo-800 disabled:to-indigo-800 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            {saving ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}

