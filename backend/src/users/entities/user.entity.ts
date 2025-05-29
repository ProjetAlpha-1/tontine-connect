import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum TrustLevel {
  RISK = 'RISK',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

@Entity('users')
@Index(['phone'], { unique: true })
@Index(['email'], { unique: true, where: 'email IS NOT NULL' })
export class User extends BaseEntity {
  @Column({ length: 20, unique: true })
  phone: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, nullable: true })
  email?: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 75.00 })
  reputationScore: number;

  @Column({
    type: 'enum',
    enum: TrustLevel,
    default: TrustLevel.SILVER
  })
  trustLevel: TrustLevel;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ default: true })
  isActive: boolean;

  // Champs pour l'authentification
  @Column({ length: 6, nullable: true })
  currentOtp?: string;

  @Column({ type: 'timestamp', nullable: true })
  otpExpiresAt?: Date;

  @Column({ type: 'int', default: 0 })
  otpAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  otpBlockedUntil?: Date;

  // Méthodes utilitaires avec correction des types
  isOtpValid(otp: string): boolean {
    const isValid = this.currentOtp === otp && 
                   this.otpExpiresAt && 
                   this.otpExpiresAt > new Date();
    return Boolean(isValid);
  }

  isOtpBlocked(): boolean {
    const isBlocked = this.otpBlockedUntil && this.otpBlockedUntil > new Date();
    return Boolean(isBlocked);
  }

  getTrustLevelInfo() {
    const levels = {
      [TrustLevel.RISK]: { name: 'Risque élevé', color: '#9b2c2c', icon: '🚨' },
      [TrustLevel.BRONZE]: { name: 'Bronze', color: '#e53e3e', icon: '⚠️' },
      [TrustLevel.SILVER]: { name: 'Argent', color: '#a0aec0', icon: '🥈' },
      [TrustLevel.GOLD]: { name: 'Or', color: '#d69e2e', icon: '🥇' },
      [TrustLevel.PLATINUM]: { name: 'Platine', color: '#38b2ac', icon: '🏆' },
    };
    return levels[this.trustLevel];
  }
}