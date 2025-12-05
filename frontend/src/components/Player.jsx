/**
 * Composant pour afficher et lire un enregistrement (audio ou vidéo)
 * Affiche les informations de l'enregistrement et un lecteur média
 */
export default function Player({ recording, onDelete }) {
  const isAudio = recording.recording_type === 'audio';
  // Construit l'URL complète du fichier
  const fileUrl = recording.file.startsWith('http')
    ? recording.file
    : `http://localhost:8000${recording.file}`;

  // Formate la date de création
  const createdAt = new Date(recording.created_at);
  const formatted = createdAt.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-200 mb-1">
            {recording.title || (isAudio ? 'Enregistrement audio' : 'Enregistrement vidéo')}
          </p>
          <p className="text-xs text-slate-400">Créé le {formatted}</p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(recording.id)}
            className="text-red-400 hover:text-red-300 text-sm ml-2"
            title="Supprimer"
          >
            🗑️
          </button>
        )}
      </div>
      <div className="mt-3">
        {isAudio ? (
          <audio controls className="w-full">
            <source src={fileUrl} type="audio/webm" />
            <source src={fileUrl} type="audio/mp4" />
            Votre navigateur ne supporte pas l'élément audio.
          </audio>
        ) : (
          <video controls className="w-full max-h-96 bg-black rounded">
            <source src={fileUrl} type="video/webm" />
            <source src={fileUrl} type="video/mp4" />
            Votre navigateur ne supporte pas l'élément vidéo.
          </video>
        )}
      </div>
    </div>
  );
}

