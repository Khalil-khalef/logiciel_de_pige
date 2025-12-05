import { useState } from 'react';

export default function TrimModal({ duration, onClose, onTrim }) {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(duration || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (startTime >= endTime) {
      alert('Le temps de début doit être inférieur au temps de fin');
      return;
    }
    onTrim(startTime, endTime);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">Découper l'enregistrement</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Temps de début (secondes)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max={duration}
              value={startTime}
              onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Temps de fin (secondes)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max={duration}
              value={endTime}
              onChange={(e) => setEndTime(parseFloat(e.target.value) || duration)}
              className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="text-sm text-slate-400">
            Durée sélectionnée: {formatDuration(endTime - startTime)}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-white transition-colors"
            >
              Découper
            </button>
          </div>
        </form>
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

