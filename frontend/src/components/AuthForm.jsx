import { useState } from 'react';

/**
 * Composant pour l'authentification (signup/login)
 * Affiche un formulaire qui bascule entre mode connexion et inscription
 */
export default function AuthForm({ onLogin, onSignup }) {
  const [mode, setMode] = useState('login'); // 'login' ou 'signup'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Efface l'erreur quand l'utilisateur tape
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await onLogin(form.username, form.password);
      } else {
        await onSignup(form.username, form.email, form.password);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Erreur d\'authentification. Vérifiez vos identifiants.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          {mode === 'login' ? 'Connexion' : 'Inscription'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="username"
              placeholder="Nom d'utilisateur"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-400"
            />
          </div>
          {mode === 'signup' && (
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email (optionnel)"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-400"
              />
            </div>
          )}
          <div>
            <input
              name="password"
              type="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-2 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-400"
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed rounded text-white font-medium transition-colors"
          >
            {loading
              ? 'Chargement...'
              : mode === 'login'
              ? 'Se connecter'
              : 'Créer un compte'}
          </button>
        </form>
        <button
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setError('');
          }}
          className="mt-4 w-full text-sm text-slate-300 hover:text-white transition-colors"
        >
          {mode === 'login'
            ? "Pas de compte ? S'inscrire"
            : 'Déjà un compte ? Se connecter'}
        </button>
      </div>
    </div>
  );
}

