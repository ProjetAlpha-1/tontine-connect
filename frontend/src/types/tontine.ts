// frontend/src/types/tontine.ts
export enum TontineStatus {
  DRAFT = 'draft',
  ENROLLMENT = 'enrollment',
  CONFIGURATION = 'configuration',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface TontineRules {
  penaltyAmount?: number;
  gracePeriodDays: number;
  allowEarlyWithdrawal: boolean;
  orderDeterminationMethod: 'random' | 'manual' | 'auction';
  minimumReputationScore?: number;
}

export interface Tontine {
  id: string;
  name: string;
  description: string;
  objective: string;
  contributionAmount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  maxParticipants: number;
  minParticipants: number;
  enrollmentDeadline: string;
  plannedStartDate: string;
  status: TontineStatus;
  creatorId: string;
  rules: TontineRules;
  createdAt: string;
  updatedAt: string;
} 
