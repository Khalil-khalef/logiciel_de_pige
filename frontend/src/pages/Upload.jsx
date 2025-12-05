import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadRecording } from '../api';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [recordingType, setRecordingType] = useState('antenne');
  const [format, setFormat] = useState('mp3');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile.type.startsWith('audio/')) {
      setError('Veuillez sélectionner un fichier audio');
      return;
    }
    setFile(selectedFile);
    setError('');
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setError('');
    setUploading(true);

    try {
      await uploadRecording(file, {
        title: title || file.name,
        type: recordingType,
        format,
      });
      navigate('/recordings');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Uploader un fichier audio</h1>
          <p className="text-slate-400">Importez un fichier audio pour le gérer</p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur border border-slate-700 p-8 rounded-xl space-y-6">
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative p-12 border-2 border-dashed rounded-xl transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-600 bg-slate-900/30 hover:border-slate-500'
            }`}
          >
            <input
              type="file"
              id="file-input"
              accept="audio/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="text-center pointer-events-none">
              <div className="text-5xl mb-3">
                {file ? '✅' : '📁'}
              </div>
              {file ? (
                <>
                  <p className="text-white font-semibold">{file.name}</p>
                  <p className="text-slate-400 text-sm mt-1">
                    {formatFileSize(file.size)}
                  </p>
                  <p className="text-indigo-400 text-sm mt-2 cursor-pointer">
                    Cliquer pour changer
                  </p>
                </>
              ) : (
                <>
                  <p className="text-white font-semibold">Glissez votre fichier audio ici</p>
                  <p className="text-slate-400 text-sm mt-2">ou cliquez pour parcourir</p>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nom de l'enregistrement"
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Recording Type */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Type d'enregistrement
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['antenne', 'emission', 'reunion'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRecordingType(type)}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    recordingType === type
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
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
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {[
                { value: 'mp3', label: 'MP3' },
                { value: 'wav', label: 'WAV' },
                { value: 'ogg', label: 'OGG' },
                { value: 'm4a', label: 'M4A' },
                { value: 'flac', label: 'FLAC' },
                { value: 'webm', label: 'WebM' },
              ].map((fmt) => (
                <button
                  key={fmt.value}
                  type="button"
                  onClick={() => setFormat(fmt.value)}
                  className={`py-2 px-4 rounded-lg font-medium transition-all ${
                    format === fmt.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg text-red-300">
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-indigo-800 disabled:to-blue-800 disabled:cursor-not-allowed rounded-lg text-white font-bold text-lg transition-all shadow-lg hover:shadow-xl"
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Upload en cours...
              </div>
            ) : (
              '📤 Uploader'
            )}
          </button>

          {/* Info */}
          <div className="bg-slate-700/50 p-4 rounded-lg text-sm text-slate-300 space-y-2">
            <p>💡 <strong>Format supportés:</strong> MP3, WAV, OGG, M4A, FLAC, WebM</p>
            <p>🔇 <strong>Détection de silence:</strong> Les fichiers uploadés seront analysés automatiquement.</p>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

