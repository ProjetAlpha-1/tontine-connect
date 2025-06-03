// backend/src/configuration/types/configuration-types.ts

export enum ConfigurationStatus {
  PENDING = 'pending',           // Configuration en cours
  AWAITING_APPROVAL = 'awaiting_approval',  // En attente d'accord des membres
  COMPLETED = 'completed',       // Configuration terminée
  CANCELLED = 'cancelled'        // Configuration annulée
}

export enum PaymentOrderType {
  MANUAL = 'manual',             // Ordre défini manuellement par le créateur
  RANDOM = 'random',             // Ordre aléatoire
  SENIORITY = 'seniority',       // Par ordre d'adhésion
  REPUTATION = 'reputation'      // Par score de réputation
}

export interface PaymentOrderConfig {
  type: PaymentOrderType;
  order: string[];               // IDs des membres dans l'ordre de paiement
  isFinalized: boolean;
  createdAt: Date;
  finalizedAt?: Date;
}

export interface FinalRules {
  penaltyAmount: number;         // Montant de pénalité en cas de retard
  gracePeriodDays: number;       // Nombre de jours de grâce
  maxMissedPayments: number;     // Nombre max de paiements manqués autorisés
  interestRate?: number;         // Taux d'intérêt si applicable
  customRules?: string[];        // Règles personnalisées ajoutées
}

export interface MemberAgreement {
  memberId: string;
  memberName: string;
  memberPhone: string;
  hasAgreed: boolean;
  agreedAt?: Date;
  comments?: string;
}

export interface TontineConfiguration {
  id: string;
  tontineId: string;
  paymentOrder: PaymentOrderConfig;
  finalRules: FinalRules;
  memberAgreements: MemberAgreement[];
  status: ConfigurationStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  
  // Métadonnées
  createdBy: string;             // ID du créateur
  totalMembers: number;
  agreedMembers: number;
  progressPercentage: number;    // Pourcentage d'accord des membres
}

// DTOs pour les requêtes API
export interface CreateConfigurationDto {
  tontineId: string;
  paymentOrderType: PaymentOrderType;
  finalRules: FinalRules;
  manualOrder?: string[];        // Requis si type = MANUAL
}

export interface UpdatePaymentOrderDto {
  type: PaymentOrderType;
  manualOrder?: string[];
}

export interface UpdateFinalRulesDto {
  penaltyAmount: number;
  gracePeriodDays: number;
  maxMissedPayments: number;
  interestRate?: number;
  customRules?: string[];
}

export interface MemberAgreementDto {
  memberId: string;
  hasAgreed: boolean;
  comments?: string;
}

export interface FinalizeConfigurationDto {
  tontineId: string;
  confirmedBy: string;           // ID du créateur qui confirme
}

// Réponses API
export interface ConfigurationResponse {
  configuration: TontineConfiguration;
  tontineInfo: {
    id: string;
    name: string;
    status: string;
    creatorId: string;
    totalMembers: number;
  };
}

export interface PaymentOrderResponse {
  paymentOrder: PaymentOrderConfig;
  members: {
    id: string;
    name: string;
    phone: string;
    joinedAt: Date;
    reputation: number;
  }[];
}

// États de validation
export interface ConfigurationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canFinalize: boolean;
  missingAgreements: string[];   // IDs des membres qui n'ont pas encore accepté
} 
