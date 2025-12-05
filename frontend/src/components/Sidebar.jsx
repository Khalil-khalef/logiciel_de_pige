import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 min-h-screen p-4 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <div className="text-2xl font-bold text-white">🎙️</div>
        <h1 className="text-xl font-bold text-white mt-2">Record</h1>
        <p className="text-xs text-slate-400 mt-1">Audio Manager</p>
      </div>
      
      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        <Link
          to="/"
          className={`block px-4 py-3 rounded-lg transition-all ${
            isActive('/') 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <span className="text-lg mr-2">📊</span>Dashboard
        </Link>
        <Link
          to="/record"
          className={`block px-4 py-3 rounded-lg transition-all ${
            isActive('/record') 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <span className="text-lg mr-2">🎤</span>Enregistrer
        </Link>
        <Link
          to="/upload"
          className={`block px-4 py-3 rounded-lg transition-all ${
            isActive('/upload') 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <span className="text-lg mr-2">📤</span>Uploader
        </Link>
        <Link
          to="/recordings"
          className={`block px-4 py-3 rounded-lg transition-all ${
            isActive('/recordings') 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <span className="text-lg mr-2">📋</span>Enregistrements
        </Link>
        <Link
          to="/silence-detection"
          className={`block px-4 py-3 rounded-lg transition-all ${
            isActive('/silence-detection') 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <span className="text-lg mr-2">🔇</span>Détection Silence
        </Link>
        <Link
          to="/settings"
          className={`block px-4 py-3 rounded-lg transition-all ${
            isActive('/settings') 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          <span className="text-lg mr-2">⚙️</span>Paramètres
        </Link>
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium transition-all shadow-lg hover:shadow-xl"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}

