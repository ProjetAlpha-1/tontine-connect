// backend/src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'votre-super-secret-jwt-key-changez-en-production',
    });
  }

  async validate(payload: any) {
    const user = { 
      sub: payload.sub,
      id: payload.sub,
      phone: payload.phone,
      name: payload.name,
      trustLevel: payload.trustLevel,
    };
    
    if (!user.sub || !user.phone) {
      throw new UnauthorizedException('Token invalide');
    }

    return user;
  }
}