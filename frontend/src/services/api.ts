import axios from 'axios';
import toast from 'react-hot-toast';
import { SendOtpRequest, SendOtpResponse, VerifyOtpRequest, AuthResponse } from '../types';

const API_BASE_URL = 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Erreur de connexion';
    toast.error(message);
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authApi = {
  sendOtp: async (data: SendOtpRequest): Promise<SendOtpResponse> => {
    const response = await apiClient.post('/auth/send-otp', data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/verify-otp', data);
    return response.data;
  },

  // Health check pour tester la connexion
  healthCheck: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  }
};