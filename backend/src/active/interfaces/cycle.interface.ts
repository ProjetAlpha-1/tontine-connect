// backend/src/active/interfaces/cycle.interface.ts

import { Payment } from './payment.interface';
import { Penalty } from './penalty.interface';

export interface Cycle {
  // Identifiants
  id: string;
  number: number;              // Numéro du cycle (1, 2, 3...)
  tontineId: string;
  
  // Bénéficiaire du cycle
  payeeId: string;
  payeeName: string;
  payeePhone: string;
  
  // Période du cycle
  startDate: Date;
  endDate: Date;
  dueDate: Date;               // Date limite des paiements
  actualEndDate?: Date;        // Date réelle de fin si différente
  
  // Montants
  expectedAmount: number;      // Montant total attendu
  collectedAmount: number;     // Montant déjà collecté
  remainingAmount: number;     // Montant manquant
  penaltyAmount: number;       // Total des pénalités du cycle
  
  // Statut et progression
  status: 'pending' | 'active' | 'completed' | 'overdue' | 'cancelled';
  completionPercentage: number; // % de completion (0-100)
  
  // Informations de participation
  expectedParticipants: number;  // Nombre de membres devant payer
  participatingMembers: number;  // Nombre de membres ayant payé
  lateMembers: string[];         // IDs des membres en retard
  pendingMembers: string[];      // IDs des membres n'ayant pas encore payé
  
  // Collections de données
  payments: Payment[];           // Paiements de ce cycle
  penalties: Penalty[];          // Pénalités de ce cycle
  
  // Métriques de performance
  onTimePayments: number;        // Nombre de paiements à l'heure
  latePayments: number;          // Nombre de paiements en retard
  avgPaymentDelay: number;       // Retard moyen en jours
  
  // Gestion des délais
  originalDueDate: Date;         // Date limite originale
  extensionRequests: CycleExtension[]; // Demandes d'extension
  hasExtensions: boolean;        // Indique si des extensions ont été accordées
  
  // Notifications envoyées
  remindersSent: CycleReminder[];
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  
  // Notes et commentaires
  notes?: string;
  adminComments?: string;
}

export interface CycleExtension {
  id: string;
  cycleId: string;
  
  // Demande d'extension
  requestedBy: string;          // ID du membre ou admin
  requestedDate: Date;
  reason: string;
  
  // Nouvelle date proposée
  newDueDate: Date;
  additionalDays: number;
  
  // Statut de la demande
  status: 'pending' | 'approved' | 'rejected';
  
  // Traitement
  reviewedBy?: string;
  reviewedAt?: Date;
  approvalReason?: string;
  
  // Impact
  affectedMembers: string[];    // Membres concernés par l'extension
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CycleReminder {
  id: string;
  cycleId: string;
  
  // Type de rappel
  type: 'initial' | 'reminder_1' | 'reminder_2' | 'final_notice' | 'overdue';
  
  // Destinataires
  recipients: string[];         // IDs des membres
  
  // Contenu
  title: string;
  message: string;
  
  // Canaux utilisés
  channels: ('sms' | 'email' | 'push')[];
  
  // Statut d'envoi
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  
  // Résultats
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  
  // Dates
  scheduledAt: Date;
  sentAt?: Date;
  
  createdAt: Date;
}
