// frontend/src/services/api.ts
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔥 INTERCEPTEUR POUR AJOUTER LE TOKEN AUTOMATIQUEMENT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tontine_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // 🐛 DEBUGGING AMÉLIORÉ
      console.log('🔐 Token ajouté à la requête:', token.substring(0, 20) + '...');
      console.log('🔐 Token complet (pour debug):', token);
      console.log('🌐 URL de la requête:', config.url);
      console.log('🔗 URL complète:', `${config.baseURL}${config.url}`);
      console.log('📋 Headers complets:', config.headers);
      
      // Vérification format token JWT
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('🔍 Payload JWT:', payload);
          console.log('⏰ Expiration token:', new Date(payload.exp * 1000));
          console.log('⏰ Maintenant:', new Date());
          console.log('✅ Token valide?', payload.exp * 1000 > Date.now());
        }
      } catch (e) {
        console.error('❌ Erreur décodage token:', e);
      }
    } else {
      console.log('⚠️ Aucun token trouvé pour la requête');
    }
    return config;
  },
  (error) => {
    console.error('❌ Erreur intercepteur request:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs (plus détaillé)
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Requête réussie:', response.config.url, response.status);
    return response;
  },
  (error) => {
    // 🐛 DEBUGGING DÉTAILLÉ DES ERREURS
    console.group('❌ ERREUR API DÉTAILLÉE');
    console.log('🌐 URL:', error.config?.url);
    console.log('📊 Status:', error.response?.status);
    console.log('📝 Message:', error.response?.data?.message || error.message);
    console.log('🔒 Headers envoyés:', error.config?.headers);
    console.log('📄 Réponse complète:', error.response?.data);
    console.groupEnd();

    // Gestion des erreurs d'authentification
    if (error.response?.status === 401) {
      console.log('❌ Token expiré ou invalide - redirection vers login');
      
      // 🔧 CORRECTION : Ne pas supprimer le token immédiatement pour permettre le debug
      // Décommenter ces lignes après le debug
      // localStorage.removeItem('tontine_token');
      // localStorage.removeItem('tontine_user');
    }
    
    const message = error.response?.data?.message || 'Erreur de connexion';
    toast.error(message);
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authApi = {
  sendOtp: async (data: any): Promise<any> => {
    const response = await apiClient.post('/auth/send-otp', data);
    return response.data;
  },
  verifyOtp: async (data: any): Promise<any> => {
    const response = await apiClient.post('/auth/verify-otp', data);
    return response.data;
  },
  // Health check pour tester la connexion
  healthCheck: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  }
};