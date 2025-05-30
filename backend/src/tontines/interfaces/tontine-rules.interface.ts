// backend/src/tontines/interfaces/tontine-rules.interface.ts
export interface TontineRules {
  penaltyAmount?: number;
  gracePeriodDays: number;
  allowEarlyWithdrawal: boolean;
  orderDeterminationMethod: 'random' | 'manual' | 'auction';
  minimumReputationScore?: number;
} 
