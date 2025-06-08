// backend/src/active/interfaces/active-tontine.interface.ts

import { TontineConfiguration } from '../../configuration/interfaces/configuration.interface';
import { Cycle } from './cycle.interface';
import { Payment } from './payment.interface';
import { Penalty } from './penalty.interface';
import { Notification } from './notification.interface';

export interface ActiveTontine {
  // Informations de base héritées
  id: string;
  name: string;
  description: string;
  contributionAmount: number;
  frequency: 'weekly' | 'monthly';
  maxMembers: number;
  duration: number;
  
  // Statut de la tontine active
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  
  // Configuration appliquée
  configuration: TontineConfiguration;
  
  // Progression des cycles
  currentCycle: number;
  totalCycles: number;
  startDate: Date;
  nextPaymentDate: Date;
  
  // Membre actuel qui reçoit
  currentPayeeId: string;
  currentPayeeName: string;
  
  // Métriques financières
  expectedAmount: number;     // Montant attendu ce cycle
  collectedAmount: number;    // Montant déjà collecté ce cycle
  totalCollected: number;     // Total depuis le début
  totalExpected: number;      // Total attendu sur toute la durée
  
  // Collections de données
  cycles: Cycle[];            // Historique des cycles
  payments: Payment[];        // Tous les paiements
  penalties: Penalty[];       // Pénalités appliquées
  notifications: Notification[]; // Alertes et messages
  
  // Métriques calculées
  participationRate: number;     // % de participation actuelle
  onTimePaymentRate: number;     // % paiements à l'heure
  avgPaymentDelay: number;       // Retard moyen en jours
  completionPercentage: number;  // % de progression globale
  
  // Membres actifs avec statuts
  activeMembers: ActiveMember[];
  
  // Dates importantes
  lastPaymentDate?: Date;
  estimatedCompletionDate: Date;
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}

export interface ActiveMember {
  id: string;
  name: string;
  phone: string;
  
  // Statut du membre
  status: 'active' | 'suspended' | 'excluded' | 'completed';
  
  // Position dans l'ordre des cycles
  cyclePosition: number;
  hasReceived: boolean;
  receivedCycle?: number;
  receivedDate?: Date;
  
  // Métriques de paiement
  totalPaid: number;
  expectedPaid: number;
  onTimePayments: number;
  latePayments: number;
  
  // Pénalités
  totalPenalties: number;
  activePenalties: Penalty[];
  
  // Dernière activité
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
  
  // Réputation
  reputationScore: number;
  trustLevel: 'low' | 'medium' | 'high';
}
