// backend/src/reputation/entities/user-reputation.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';

@Entity('user_reputations')
@Index(['userId', 'tontineId'], { unique: true })
export class UserReputationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column('uuid')
  @Index()
  tontineId: string;

  // Score global (0-1000)
  @Column('int', { default: 500 })
  totalScore: number;

  @Column('enum', { 
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'bronze'
  })
  level: string;

  // Scores par catégorie (0-100)
  @Column('decimal', { precision: 5, scale: 2, default: 50.00 })
  paymentReliabilityScore: number;

  @Column('decimal', { precision: 5, scale: 2, default: 50.00 })
  participationScore: number;

  @Column('decimal', { precision: 5, scale: 2, default: 50.00 })
  leadershipScore: number;

  @Column('decimal', { precision: 5, scale: 2, default: 50.00 })
  complianceScore: number;

  @Column('decimal', { precision: 5, scale: 2, default: 50.00 })
  socialScore: number;

  @Column('decimal', { precision: 5, scale: 2, default: 50.00 })
  overallPerformanceScore: number;

  // Métriques de base
  @Column('int', { default: 0 })
  totalPayments: number;

  @Column('int', { default: 0 })
  onTimePayments: number;

  @Column('int', { default: 0 })
  latePayments: number;

  @Column('int', { default: 0 })
  missedPayments: number;

  @Column('int', { default: 0 })
  totalPenalties: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  totalPenaltyAmount: number;

  // Métriques calculées
  @Column('decimal', { precision: 5, scale: 2, default: 0.00 })
  averagePaymentDelay: number;

  @Column('decimal', { precision: 5, scale: 2, default: 100.00 })
  paymentReliabilityRate: number;

  @Column('decimal', { precision: 5, scale: 2, default: 100.00 })
  participationRate: number;

  // Prédictions et tendances
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  predictedNextPaymentProbability: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0.00 })
  riskScore: number;

  @Column('json', { nullable: true })
  trendData: {
    last7Days: number;
    last30Days: number;
    last90Days: number;
    direction: 'up' | 'down' | 'stable';
  };

  // Badges et achievements
  @Column('simple-array', { nullable: true })
  activeBadges: string[];

  @Column('int', { default: 0 })
  totalBadgesEarned: number;

  // Métadonnées
  @Column('timestamp', { nullable: true })
  lastActivityDate: Date;

  @Column('timestamp', { nullable: true })
  lastReputationUpdate: Date;

  @Column('int', { default: 0 })
  totalEvents: number;

  @Column('json', { nullable: true })
  additionalMetrics: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
