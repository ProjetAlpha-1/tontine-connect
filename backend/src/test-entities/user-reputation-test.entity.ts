// backend/src/test-entities/user-reputation-test.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('user_reputations_test')
@Index(['userId', 'tontineId'], { unique: true })
export class UserReputationTestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column('uuid') 
  @Index()
  tontineId: string;

  @Column('int', { default: 500 })
  totalScore: number;

  @Column('enum', { 
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'bronze'
  })
  level: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
