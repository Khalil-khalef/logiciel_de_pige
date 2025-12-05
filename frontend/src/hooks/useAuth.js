import { useState, useEffect } from 'react';
import { api, setAuthToken } from '../api';

/**
 * Hook personnalisé pour gérer l'authentification
 * Gère le login, signup, logout et le stockage du token JWT
 */
export function useAuth() {
  // Récupère le token depuis le localStorage au chargement
  const [token, setToken] = useState(() => {
    return localStorage.getItem('access') || null;
  });

  // Met à jour le header Authorization à chaque changement de token
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  /**
   * Fonction de connexion
   * @param {string} username - Nom d'utilisateur
   * @param {string} password - Mot de passe
   */
  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login/', { username, password });
      const access = res.data.access;
      localStorage.setItem('access', access);
      setToken(access);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Fonction d'inscription puis connexion automatique
   * @param {string} username - Nom d'utilisateur
   * @param {string} email - Email (optionnel)
   * @param {string} password - Mot de passe
   */
  const signup = async (username, email, password) => {
    try {
      await api.post('/auth/signup/', { username, email, password });
      // Connexion automatique après inscription
      await login(username, password);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Fonction de déconnexion
   * Supprime le token du localStorage et de l'état
   */
  const logout = () => {
    localStorage.removeItem('access');
    setToken(null);
  };

  return {
    token,
    login,
    signup,
    logout,
    isAuthenticated: !!token,
  };
}

