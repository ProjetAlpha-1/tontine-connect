import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SendOtpDto, VerifyOtpDto } from './dto/send-otp.dto';
import { JwtPayload, AuthResponse } from './interfaces/jwt-payload.interface';

// Base de données simulée en mémoire (temporaire)
const users = new Map();

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async sendOtp(sendOtpDto: SendOtpDto): Promise<{ message: string; expiresIn: number; otp?: string }> {
    const { phone } = sendOtpDto;

    // Générer un nouveau OTP
    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Stocker temporairement en mémoire
    users.set(phone, {
      phone,
      otp,
      otpExpiresAt,
      attempts: 0,
    });

    // Simuler l'envoi SMS
    console.log(`📱 SMS pour ${phone}: Votre code TontineConnect est ${otp}`);
    
    const response: { message: string; expiresIn: number; otp?: string } = {
      message: `Code OTP envoyé au ${phone}`,
      expiresIn: 600, // 10 minutes en secondes
    };

    if (process.env.NODE_ENV === 'development') {
      response.otp = otp;
    }

    return response;
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<AuthResponse> {
    const { phone, otp, name } = verifyOtpDto;

    const userData = users.get(phone);
    if (!userData) {
      throw new BadRequestException('Utilisateur introuvable. Demandez d\'abord un code OTP.');
    }

    // Vérifier l'OTP
    if (userData.otp !== otp || userData.otpExpiresAt < new Date()) {
      userData.attempts += 1;
      throw new UnauthorizedException('Code OTP invalide ou expiré');
    }

    // Créer l'utilisateur simulé
    const user = {
      id: this.generateId(),
      phone,
      name: name || 'Utilisateur TontineConnect',
      email: undefined,
      isVerified: true,
      reputationScore: 75,
      trustLevel: 'SILVER',
      createdAt: new Date(),
    };

    // Supprimer l'OTP temporaire
    users.delete(phone);

    // Générer les tokens JWT
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        reputationScore: user.reputationScore,
        trustLevel: user.trustLevel,
        trustLevelInfo: {
          name: 'Argent',
          color: '#a0aec0',
          icon: '🥈'
        },
      },
      tokens,
    };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private async generateTokens(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      name: user.name,
      trustLevel: user.trustLevel,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 heure en secondes
    };
  }
}