// backend/src/configuration/interfaces/configuration.interface.ts

export interface TontineConfiguration {
  // Configuration générale
  id: string;
  name: string;
  type: 'standard' | 'advanced' | 'custom';
  
  // Règles de paiement
  paymentRules: {
    gracePeriodDays: number;        // Période de grâce en jours
    lateFeesEnabled: boolean;       // Frais de retard activés
    lateFeeAmount: number;          // Montant des frais de retard
    lateFeeType: 'fixed' | 'percentage';
    maxLatePayments: number;        // Nombre max de retards tolérés
    autoExclusionEnabled: boolean;  // Exclusion automatique
  };
  
  // Configuration des cycles
  cycleConfiguration: {
    orderType: 'fixed' | 'random' | 'auction';
    allowOrderChange: boolean;      // Permettre changement d'ordre
    cycleBufferDays: number;        // Jours tampon entre cycles
    advanceNotificationDays: number; // Préavis avant échéance
  };
  
  // Règles de participation
  participationRules: {
    minParticipationRate: number;   // % minimum de participation
    allowPartialPayments: boolean;  // Paiements partiels autorisés
    minPartialPaymentAmount: number;
    maxMissedPayments: number;      // Paiements manqués max
  };
  
  // Configuration des notifications
  notificationSettings: {
    enableEmailNotifications: boolean;
    enableSmsNotifications: boolean;
    enablePushNotifications: boolean;
    reminderFrequency: 'daily' | 'weekly' | 'custom';
    customReminderDays: number[];
  };
  
  // Système de réputation
  reputationSettings: {
    enabled: boolean;
    scoreVisibility: 'public' | 'private' | 'admin_only';
    initialScore: number;
    onTimeBonus: number;
    latePaymentPenalty: number;
    missedPaymentPenalty: number;
  };
  
  // Règles financières
  financialRules: {
    currency: string;
    allowAdvancePayments: boolean;  // Paiements anticipés
    interestOnAdvance: number;      // Intérêts sur avance
    fundManagementFee: number;      // Frais de gestion %
    withdrawalRules: {
      allowEarlyWithdrawal: boolean;
      earlyWithdrawalPenalty: number;
    };
  };
  
  // Sécurité et validation
  securitySettings: {
    requirePhoneVerification: boolean;
    requireIdVerification: boolean;
    minimumReputationScore: number;
    backgroundCheckRequired: boolean;
  };
  
  // Métadonnées
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: string;
}

export interface ConfigurationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'business' | 'community' | 'family';
  configuration: Partial<TontineConfiguration>;
  isDefault: boolean;
  popularity: number;
  createdAt: Date;
}

export interface ConfigurationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
} 
