import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats, getRecordings } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentRecordings, setRecentRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, recordingsData] = await Promise.all([
        getStats(),
        getRecordings(),
      ]);
      setStats(statsData);
      setRecentRecordings((recordingsData.results || recordingsData).slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="animate-pulse">
          <div className="text-slate-400 text-lg">Chargement du tableau de bord...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tableau de bord</h1>
          <p className="text-slate-400">Gérez vos enregistrements audio</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-200 text-sm font-medium">Total</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                </div>
                <div className="text-4xl opacity-20">📊</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-200 text-sm font-medium">Durée totale</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {formatDuration(stats.total_duration_seconds)}
                  </p>
                </div>
                <div className="text-4xl opacity-20">⏱️</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm font-medium">Types d'enregistrements</p>
                  <p className="text-sm text-green-100 mt-2">
                    A: {stats.by_type?.antenne || 0} | E: {stats.by_type?.emission || 0} | R: {stats.by_type?.reunion || 0}
                  </p>
                </div>
                <div className="text-4xl opacity-20">🎙️</div>
              </div>
            </div>

            {stats.flagged > 0 && (
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-200 text-sm font-medium">Marqués</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.flagged}</p>
                  </div>
                  <div className="text-4xl opacity-20">⚠️</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Alerts Section */}
        {stats && stats.flagged > 0 && (
          <div className="bg-red-900/20 border border-red-700 p-6 rounded-xl mb-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-red-400 text-2xl">⚠️</span>
              <h2 className="text-lg font-semibold text-red-400">Alertes</h2>
            </div>
            <p className="text-red-200 mb-4">
              {stats.flagged} enregistrement(s) marqué(s) pour révision (blancs détectés)
            </p>
            <Link
              to="/silence-detection"
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium transition-colors"
            >
              Voir les détails →
            </Link>
          </div>
        )}

        {/* Recent Recordings */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Enregistrements récents</h2>
            <Link
              to="/recordings"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Voir tout →
            </Link>
          </div>

          {recentRecordings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-slate-400">Aucun enregistrement récent</p>
              <Link
                to="/record"
                className="inline-block mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-colors"
              >
                Commencer un enregistrement
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRecordings.map((recording) => (
                <Link
                  key={recording.id}
                  to={`/recordings/${recording.id}`}
                  className="block p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-all hover:shadow-lg"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎙️</span>
                        <div className="text-white font-semibold">
                          {recording.title || 'Sans titre'}
                        </div>
                      </div>
                      <div className="text-slate-400 text-sm mt-1">
                        <span className="inline-block px-2 py-1 bg-slate-600 rounded mr-2 text-xs">
                          {recording.type}
                        </span>
                        <span>{formatDuration(recording.duration_seconds)}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(recording.created_at).toLocaleString('fr-FR')}</span>
                      </div>
                    </div>
                    {recording.flagged && (
                      <div className="flex-shrink-0 text-2xl">⚠️</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/record"
            className="p-4 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-lg text-white font-medium transition-all shadow-lg hover:shadow-xl text-center"
          >
            🎤 Nouvel enregistrement
          </Link>
          <Link
            to="/upload"
            className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg text-white font-medium transition-all shadow-lg hover:shadow-xl text-center"
          >
            📤 Uploader un fichier
          </Link>
          <Link
            to="/settings"
            className="p-4 bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 rounded-lg text-white font-medium transition-all shadow-lg hover:shadow-xl text-center"
          >
            ⚙️ Paramètres
          </Link>
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

