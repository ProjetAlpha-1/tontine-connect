import { Controller, Post, Get, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto } from './dto/send-otp.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @ApiOperation({ summary: 'Envoyer un code OTP par SMS' })
  @ApiResponse({
    status: 200,
    description: 'Code OTP envoyé avec succès'
  })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return await this.authService.sendOtp(sendOtpDto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Vérifier le code OTP et se connecter' })
  @ApiResponse({
    status: 200,
    description: 'Authentification réussie'
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.authService.verifyOtp(verifyOtpDto);
  }

  // ✅ Route profile simplifiée sans guard (pour l'instant)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir le profil de l\'utilisateur connecté' })
  @ApiResponse({
    status: 200,
    description: 'Profil utilisateur récupéré avec succès'
  })
  async getProfile(@Headers('authorization') authorization?: string) {
    // Validation basique du token
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token d\'authentification requis');
    }

    const token = authorization.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedException('Token invalide');
    }

    // Pour l'instant, retourner des données statiques
    // TODO: Décoder le JWT et récupérer les vraies données utilisateur
    return {
      id: 'user-123',
      phone: '+241XXXXXXXX',
      name: 'Utilisateur connecté',
      createdAt: new Date().toISOString()
    };
  }
}