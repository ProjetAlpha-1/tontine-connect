// backend/src/active/interfaces/penalty.interface.ts

export interface Penalty {
  // Identifiants
  id: string;
  tontineId: string;
  cycleId: string;
  memberId: string;
  memberName: string;
  paymentId?: string;           // Paiement associé si applicable
  
  // Type et raison de la pénalité
  type: 'late_payment' | 'missed_payment' | 'partial_payment' | 'behavior' | 'manual' | 'automatic';
  reason: string;
  category: 'financial' | 'behavioral' | 'administrative';
  
  // Montants
  amount: number;
  originalAmount?: number;      // Montant original avant ajustements
  
  // Calcul de la pénalité
  calculationMethod: 'fixed' | 'percentage' | 'daily' | 'escalating' | 'custom';
  calculationBase?: number;     // Base de calcul (montant du paiement, etc.)
  calculationRate?: number;     // Taux ou pourcentage
  
  // Période concernée
  violationDate: Date;          // Date de la violation
  daysLate?: number;            // Nombre de jours de retard
  gracePeriodUsed: boolean;     // Si la période de grâce a été utilisée
  
  // Statut de la pénalité
  status: 'pending' | 'applied' | 'paid' | 'waived' | 'disputed' | 'cancelled';
  
  // Application et paiement
  appliedDate?: Date;
  appliedBy?: string;           // ID de l'admin qui a appliqué
  paidDate?: Date;
  paidAmount?: number;
  
  // Dispense et remise
  waived: boolean;
  waivedDate?: Date;
  waivedBy?: string;            // ID de l'admin qui a dispensé
  waivedReason?: string;
  waivedAmount?: number;        // Montant dispensé (peut être partiel)
  
  // Contestation
  disputed: boolean;
  disputeDate?: Date;
  disputeReason?: string;
  disputeStatus?: 'pending' | 'resolved' | 'rejected';
  disputeResolution?: string;
  disputeResolvedBy?: string;
  disputeResolvedAt?: Date;
  
  // Escalade
  escalationLevel: number;      // 0 = première pénalité, 1+ = escalade
  previousPenalties: string[];  // IDs des pénalités précédentes
  nextEscalationDate?: Date;
  
  // Impact sur le membre
  impactOnReputation: number;   // Points de réputation perdus
  impactOnTrustLevel: 'none' | 'minor' | 'major' | 'severe';
  
  // Récurrence et pattern
  isRecurring: boolean;
  recurringPattern?: PenaltyRecurrence;
  
  // Notifications envoyées
  notificationsSent: PenaltyNotification[];
  
  // Notes et justifications
  adminNotes?: string;
  memberResponse?: string;
  internalNotes?: string;
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  
  // Audit et historique
  history: PenaltyHistoryEntry[];
}

export interface PenaltyRecurrence {
  id: string;
  penaltyId: string;
  
  // Configuration de récurrence
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;             // Intervalle (ex: tous les 2 jours)
  maxOccurrences?: number;      // Nombre max d'occurrences
  endDate?: Date;               // Date de fin de récurrence
  
  // Progression
  currentOccurrence: number;
  nextOccurrenceDate: Date;
  
  // Escalade automatique
  escalateAmount: boolean;      // Si le montant augmente
  escalationRate?: number;      // Taux d'escalade
  maxAmount?: number;           // Montant maximum
  
  // Statut
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface PenaltyNotification {
  id: string;
  penaltyId: string;
  
  // Type de notification
  type: 'penalty_applied' | 'payment_reminder' | 'final_notice' | 'waiver_granted' | 'dispute_update';
  
  // Destinataire
  recipientId: string;
  recipientType: 'member' | 'admin' | 'group';
  
  // Contenu
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Canaux
  channels: ('sms' | 'email' | 'push' | 'in_app')[];
  
  // Statut d'envoi
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  
  // Résultats
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  
  // Réponse
  responseReceived: boolean;
  responseDate?: Date;
  responseContent?: string;
  
  createdAt: Date;
}

export interface PenaltyHistoryEntry {
  id: string;
  penaltyId: string;
  
  // Action effectuée
  action: 'created' | 'applied' | 'paid' | 'waived' | 'disputed' | 'escalated' | 'cancelled' | 'modified';
  
  // Détails du changement
  previousStatus?: string;
  newStatus?: string;
  previousAmount?: number;
  newAmount?: number;
  changes?: Record<string, any>;
  
  // Qui a fait l'action
  performedBy: string;          // ID de l'utilisateur
  performerName: string;
  performerRole: 'member' | 'admin' | 'system';
  
  // Contexte
  reason?: string;
  notes?: string;
  
  // Quand
  performedAt: Date;
  
  // Métadonnées
  metadata?: Record<string, any>;
}

export interface PenaltySettings {
  // Configuration globale des pénalités
  enabledPenalties: boolean;
  gracePeriodDays: number;
  
  // Calculs par défaut
  defaultLatePaymentRate: number;    // Pourcentage
  defaultFixedAmount: number;
  maxPenaltyPercentage: number;      // % max du montant du paiement
  
  // Escalade
  enableEscalation: boolean;
  escalationThreshold: number;       // Nombre de pénalités avant escalade
  escalationMultiplier: number;
  
  // Dispenses automatiques
  autoWaiverConditions: string[];
  
  // Notifications
  notifyOnApplication: boolean;
  notifyOnPayment: boolean;
  reminderFrequency: number;         // Jours entre rappels
}
