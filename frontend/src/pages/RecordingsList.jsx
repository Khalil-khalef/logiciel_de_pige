import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecordings, deleteRecording } from '../api';

export default function RecordingsList() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      setLoading(true);
      const data = await getRecordings();
      setRecordings(data.results || data);
    } catch (err) {
      setError('Erreur lors du chargement des enregistrements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
      return;
    }

    try {
      await deleteRecording(id);
      setRecordings(recordings.filter(r => r.id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const getTypeEmoji = (type) => {
    const emojis = { antenne: '📻', emission: '📺', reunion: '👥' };
    return emojis[type] || '🎙️';
  };

  const filteredRecordings = recordings.filter(r => {
    const matchesFilter = filter === 'all' || r.type === filter;
    const matchesSearch = !searchTerm || r.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-lg">Chargement des enregistrements...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Mes enregistrements</h1>
          <p className="text-slate-400">Gérez et éditez vos fichiers audio</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Rechercher un enregistrement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            {['all', 'antenne', 'emission', 'reunion'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {f === 'all' && 'Tous'}
                {f === 'antenne' && '📻 Antenne'}
                {f === 'emission' && '📺 Émission'}
                {f === 'reunion' && '👥 Réunion'}
              </button>
            ))}
          </div>
          <button
            onClick={loadRecordings}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors"
          >
            🔄 Actualiser
          </button>
        </div>

        {/* Recordings Grid */}
        {filteredRecordings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-slate-400 text-lg">Aucun enregistrement trouvé</p>
            <Link
              to="/record"
              className="inline-block mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-colors"
            >
              Créer un nouvel enregistrement
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecordings.map((recording) => (
              <div
                key={recording.id}
                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-all hover:shadow-lg"
              >
                {/* Card Header */}
                <div className="p-4 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 border-b border-slate-700">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{getTypeEmoji(recording.type)}</span>
                        <span className="text-xs font-semibold text-slate-400 uppercase">{recording.type}</span>
                      </div>
                      <h3 className="text-white font-bold truncate text-lg">
                        {recording.title || 'Sans titre'}
                      </h3>
                    </div>
                    {recording.flagged && (
                      <div className="flex-shrink-0 text-2xl">⚠️</div>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>⏱️ {formatDuration(recording.duration_seconds)}</span>
                    <span>📅 {new Date(recording.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>

                  {recording.custom_name && (
                    <div className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
                      {recording.custom_name}
                    </div>
                  )}

                  {recording.flagged && (
                    <div className="bg-red-900/30 border border-red-700 p-2 rounded text-red-300 text-xs">
                      ⚠️ Marqué pour révision (silences détectés)
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-slate-700/30 border-t border-slate-700 flex gap-2">
                  <Link
                    to={`/recordings/${recording.id}`}
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-medium text-center transition-colors"
                  >
                    👁️ Voir
                  </Link>
                  <button
                    onClick={() => handleDelete(recording.id)}
                    className="py-2 px-4 bg-red-600 hover:bg-red-500 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {recordings.length > 0 && (
          <div className="mt-12 p-6 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-400">{recordings.length}</div>
                <div className="text-sm text-slate-400">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{formatDuration(recordings.reduce((sum, r) => sum + r.duration_seconds, 0))}</div>
                <div className="text-sm text-slate-400">Durée totale</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{recordings.filter(r => r.flagged).length}</div>
                <div className="text-sm text-slate-400">Marqués</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{recordings.filter(r => !r.flagged).length}</div>
                <div className="text-sm text-slate-400">OK</div>
              </div>
            </div>
          </div>
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

