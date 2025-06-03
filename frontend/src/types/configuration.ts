// frontend/src/types/configuration.ts

export enum ConfigurationStatus {
  PENDING = 'pending',
  AWAITING_APPROVAL = 'awaiting_approval',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentOrderType {
  MANUAL = 'manual',
  RANDOM = 'random',
  SENIORITY = 'seniority',
  REPUTATION = 'reputation'
}

export interface PaymentOrderConfig {
  type: PaymentOrderType;
  order: string[];
  isFinalized: boolean;
  createdAt: string;
  finalizedAt?: string;
}

export interface FinalRules {
  penaltyAmount: number;
  gracePeriodDays: number;
  maxMissedPayments: number;
  interestRate?: number;
  customRules?: string[];
}

export interface MemberAgreement {
  memberId: string;
  memberName: string;
  memberPhone: string;
  hasAgreed: boolean;
  agreedAt?: string;
  comments?: string;
}

export interface TontineConfiguration {
  id: string;
  tontineId: string;
  paymentOrder: PaymentOrderConfig;
  finalRules: FinalRules;
  memberAgreements: MemberAgreement[];
  status: ConfigurationStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  createdBy: string;
  totalMembers: number;
  agreedMembers: number;
  progressPercentage: number;
}

export interface TontineInfo {
  id: string;
  name: string;
  status: string;
  creatorId: string;
  totalMembers: number;
}

export interface ConfigurationResponse {
  configuration: TontineConfiguration;
  tontineInfo: TontineInfo;
}

export interface MemberWithDetails {
  id: string;
  name: string;
  phone: string;
  joinedAt: string;
  reputation: number;
}

export interface PaymentOrderResponse {
  paymentOrder: PaymentOrderConfig;
  members: MemberWithDetails[];
}

export interface ConfigurationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canFinalize: boolean;
  missingAgreements: string[];
}

// DTOs pour les formulaires
export interface CreateConfigurationFormData {
  paymentOrderType: PaymentOrderType;
  penaltyAmount: number;
  gracePeriodDays: number;
  maxMissedPayments: number;
  interestRate?: number;
  customRules?: string[];
  manualOrder?: string[];
}

export interface UpdatePaymentOrderFormData {
  type: PaymentOrderType;
  manualOrder?: string[];
}

export interface MemberAgreementFormData {
  hasAgreed: boolean;
  comments?: string;
}

// Options pour les sélecteurs
export const PAYMENT_ORDER_OPTIONS = [
  { value: PaymentOrderType.MANUAL, label: 'Ordre manuel', description: 'Définir l\'ordre manuellement' },
  { value: PaymentOrderType.RANDOM, label: 'Ordre aléatoire', description: 'Ordre généré aléatoirement' },
  { value: PaymentOrderType.SENIORITY, label: 'Par ancienneté', description: 'Premier arrivé, premier servi' },
  { value: PaymentOrderType.REPUTATION, label: 'Par réputation', description: 'Selon le score de réputation' }
];

// Messages d'état
export const CONFIGURATION_STATUS_MESSAGES = {
  [ConfigurationStatus.PENDING]: {
    label: 'Configuration en cours',
    color: 'orange',
    description: 'La configuration est en cours de définition'
  },
  [ConfigurationStatus.AWAITING_APPROVAL]: {
    label: 'En attente d\'approbation',
    color: 'blue',
    description: 'En attente de l\'accord de tous les membres'
  },
  [ConfigurationStatus.COMPLETED]: {
    label: 'Configuration terminée',
    color: 'green',
    description: 'La tontine est prête à être activée'
  },
  [ConfigurationStatus.CANCELLED]: {
    label: 'Configuration annulée',
    color: 'red',
    description: 'La configuration a été annulée'
  }
};
