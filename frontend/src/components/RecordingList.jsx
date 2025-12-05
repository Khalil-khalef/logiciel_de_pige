import { useEffect, useState } from 'react';
import { api } from '../api';
import Player from './Player';

/**
 * Composant pour afficher la liste des enregistrements de l'utilisateur
 * Récupère les enregistrements depuis l'API et les affiche
 */
export default function RecordingList({ refreshKey, onRefresh }) {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecordings = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/recordings/');
        setRecordings(res.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des enregistrements:', err);
        setError('Erreur lors du chargement des enregistrements.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecordings();
  }, [refreshKey]);

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
      return;
    }

    try {
      await api.delete(`/recordings/${id}/`);
      // Rafraîchit la liste après suppression
      if (onRefresh) {
        onRefresh();
      } else {
        setRecordings(recordings.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-slate-400">Chargement...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">{error}</div>
    );
  }

  if (!recordings.length) {
    return (
      <div className="text-center py-8 text-slate-400">
        Aucun enregistrement pour l'instant. Commencez par enregistrer quelque chose !
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recordings.map((rec) => (
        <Player key={rec.id} recording={rec} onDelete={handleDelete} />
      ))}
    </div>
  );
}

