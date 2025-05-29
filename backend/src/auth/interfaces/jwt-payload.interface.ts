 
export interface JwtPayload {
  sub: string;  // User ID
  phone: string;
  name: string;
  trustLevel: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: {
    id: string;
    phone: string;
    name: string;
    email?: string;
    isVerified: boolean;
    reputationScore: number;
    trustLevel: string;
    trustLevelInfo: {
      name: string;
      color: string;
      icon: string;
    };
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}