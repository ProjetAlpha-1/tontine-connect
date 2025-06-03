// frontend/src/hooks/useAuth.ts

import { useState, useEffect } from 'react';

interface User {
  id: string;
  phone: string;
  name?: string;
  isAuthenticated: boolean;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'utilisateur depuis le localStorage au démarrage
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('tontine_user');
        const storedToken = localStorage.getItem('tontine_token');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser({
            ...userData,
            isAuthenticated: true
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        // Nettoyer les données corrompues
        localStorage.removeItem('tontine_user');
        localStorage.removeItem('tontine_token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Connexion (simulation - à adapter selon votre service auth)
  const login = async (phone: string, otp: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Ici vous pouvez appeler votre service d'authentification
      // Pour l'instant, simulation avec données temporaires
      const userData: User = {
        id: `user_${Date.now()}`,
        phone: phone,
        name: 'Utilisateur Connecté',
        isAuthenticated: true
      };

      // Simuler un token
      const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Sauvegarder dans localStorage
      localStorage.setItem('tontine_user', JSON.stringify(userData));
      localStorage.setItem('tontine_token', token);

      setUser(userData);
      return true;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('tontine_user');
    localStorage.removeItem('tontine_token');
    setUser(null);
  };

  // Mettre à jour les données utilisateur
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('tontine_user', JSON.stringify(updatedUser));
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user?.isAuthenticated,
    login,
    logout,
    updateUser
  };
}; 
