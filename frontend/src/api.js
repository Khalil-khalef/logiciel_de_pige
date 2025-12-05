import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Créer une instance axios
const api = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401 (non autorisé)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré, rediriger vers login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Fonctions API

/**
 * Inscription d'un nouvel utilisateur
 */
export const signup = async (userData) => {
  const response = await api.post('/api/signup/', userData);
  return response.data;
};

/**
 * Connexion avec username et password
 */
export const login = async (username, password) => {
  const response = await api.post('/api/token/', { username, password });
  const { access, refresh } = response.data;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  return { access, refresh };
};

/**
 * Rafraîchir le token
 */
export const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('No refresh token');
  const response = await api.post('/api/token/refresh/', { refresh });
  const { access } = response.data;
  localStorage.setItem('access_token', access);
  return access;
};

/**
 * Récupérer tous les enregistrements
 */
export const getRecordings = async () => {
  const response = await api.get('/api/recordings/');
  return response.data;
};

/**
 * Récupérer un enregistrement par ID
 */
export const getRecording = async (id) => {
  const response = await api.get(`/api/recordings/${id}/`);
  return response.data;
};

/**
 * Uploader un fichier audio
 */
export const uploadRecording = async (file, data = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  if (data.title) formData.append('title', data.title);
  if (data.type) formData.append('type', data.type);
  if (data.custom_name) formData.append('custom_name', data.custom_name);
  if (data.format) formData.append('format', data.format);
  if (data.retained_until) formData.append('retained_until', data.retained_until);
  
  const response = await api.post('/api/recordings/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Découper un enregistrement (trim)
 */
export const trimRecording = async (id, startTime, endTime) => {
  const response = await api.post(`/api/recordings/${id}/trim/`, {
    start_time: startTime,
    end_time: endTime,
  });
  return response.data;
};

/**
 * Relancer le traitement d'un enregistrement
 */
export const processRecording = async (id) => {
  const response = await api.post(`/api/recordings/${id}/process/`);
  return response.data;
};

/**
 * Supprimer un enregistrement
 */
export const deleteRecording = async (id) => {
  const response = await api.delete(`/api/recordings/${id}/`);
  return response.data;
};

/**
 * Récupérer les statistiques
 */
export const getStats = async () => {
  const response = await api.get('/api/recordings/stats/');
  return response.data;
};

/**
 * Télécharger un enregistrement
 */
export const downloadRecording = async (id) => {
  const response = await api.get(`/api/recordings/${id}/download/`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Récupérer les paramètres utilisateur
 */
export const getSettings = async () => {
  const response = await api.get('/api/settings/');
  // Si c'est une liste, prendre le premier élément
  if (Array.isArray(response.data)) {
    return response.data[0] || {};
  }
  return response.data;
};

/**
 * Mettre à jour les paramètres utilisateur
 */
export const updateSettings = async (settings) => {
  // Récupérer d'abord les settings existants pour obtenir l'ID
  const currentSettings = await getSettings();
  if (currentSettings && currentSettings.id) {
    const response = await api.put(`/api/settings/${currentSettings.id}/`, settings);
    return response.data;
  } else {
    // Créer si n'existe pas
    const response = await api.post('/api/settings/', settings);
    return response.data;
  }
};

export default api;

