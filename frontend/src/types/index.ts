// Types pour l'authentification
export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  isVerified: boolean;
  reputationScore: number;
  trustLevel: TrustLevel;
  trustLevelInfo: {
    name: string;
    color: string;
    icon: string;
  };
}

export type TrustLevel = 'RISK' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface SendOtpRequest {
  phone: string;
}

export interface SendOtpResponse {
  message: string;
  expiresIn: number;
  otp?: string; // En développement seulement
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
  name?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
} 
