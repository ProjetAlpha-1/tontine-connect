// backend/src/active/interfaces/notification.interface.ts

export interface Notification {
  // Identifiants
  id: string;
  tontineId: string;
  cycleId?: string;
  paymentId?: string;
  penaltyId?: string;
  
  // Type et catégorie
  type: NotificationType;
  category: 'payment' | 'cycle' | 'penalty' | 'system' | 'social' | 'admin' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  
  // Contenu de la notification
  title: string;
  message: string;
  shortMessage?: string;        // Version courte pour SMS/push
  fullMessage?: string;         // Version complète pour email
  
  // Destinataires
  recipients: NotificationRecipient[];
  targetAudience: 'individual' | 'group' | 'all_members' | 'admins_only' | 'specific_roles';
  
  // Canaux de diffusion
  channels: NotificationChannel[];
  preferredChannel?: 'sms' | 'email' | 'push' | 'in_app';
  
  // Planification
  scheduledAt?: Date;           // Envoi programmé
  sendImmediately: boolean;
  
  // Statut d'envoi
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  
  // Résultats d'envoi
  deliveryResults: NotificationDeliveryResult[];
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalRead: number;
  
  // Actions associées
  actionRequired: boolean;
  actionType?: 'confirm_payment' | 'make_payment' | 'update_info' | 'contact_admin' | 'join_meeting';
  actionUrl?: string;
  actionDeadline?: Date;
  
  // Personnalisation
  personalized: boolean;
  templateId?: string;
  variables?: Record<string, any>; // Variables pour la personnalisation
  
  // Réponses et interactions
  allowReplies: boolean;
  responses: NotificationResponse[];
  
  // Récurrence
  isRecurring: boolean;
  recurrence?: NotificationRecurrence;
  
  // Expiration
  expiresAt?: Date;
  autoDelete: boolean;
  autoDeleteAfterDays?: number;
  
  // Métadonnées
  createdBy: string;            // ID de l'utilisateur créateur
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  
  // Tags et filtres
  tags?: string[];
  
  // Notes internes
  internalNotes?: string;
}

export type NotificationType = 
  | 'payment_reminder'
  | 'payment_overdue'
  | 'payment_confirmed'
  | 'cycle_started'
  | 'cycle_ending'
  | 'cycle_completed'
  | 'your_turn_next'
  | 'penalty_applied'
  | 'penalty_waived'
  | 'member_joined'
  | 'member_left'
  | 'tontine_completed'
  | 'system_maintenance'
  | 'deadline_extension'
  | 'dispute_filed'
  | 'admin_message'
  | 'custom';

export interface NotificationRecipient {
  id: string;
  notificationId: string;
  
  // Destinataire
  userId: string;
  userName: string;
  userRole: 'member' | 'admin' | 'observer';
  
  // Contact
  phone?: string;
  email?: string;
  
  // Préférences
  preferredChannels: ('sms' | 'email' | 'push' | 'in_app')[];
  optedOut: boolean;
  optOutReason?: string;
  
  // Statut spécifique à ce destinataire
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'skipped';
  
  // Résultats d'envoi
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failureReason?: string;
  
  // Réponse
  hasResponded: boolean;
  responseDate?: Date;
  responseContent?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationChannel {
  type: 'sms' | 'email' | 'push' | 'in_app' | 'whatsapp';
  enabled: boolean;
  
  // Configuration spécifique au canal
  config?: {
    // SMS
    smsProvider?: 'twilio' | 'local_provider';
    smsTemplate?: string;
    
    // Email
    emailTemplate?: string;
    emailSubject?: string;
    attachments?: string[];
    
    // Push
    pushTitle?: string;
    pushIcon?: string;
    pushSound?: string;
    
    // WhatsApp
    whatsappTemplate?: string;
  };
  
  // Résultats pour ce canal
  attempted: boolean;
  successful: boolean;
  errorMessage?: string;
  
  // Coûts
  cost?: number;
  currency?: string;
}

export interface NotificationDeliveryResult {
  id: string;
  notificationId: string;
  recipientId: string;
  
  // Canal utilisé
  channel: 'sms' | 'email' | 'push' | 'in_app';
  
  // Résultat
  status: 'success' | 'failed' | 'partial';
  
  // Détails techniques
  providerResponse?: any;
  errorCode?: string;
  errorMessage?: string;
  
  // Métriques
  attemptNumber: number;
  responseTime: number;        // ms
  
  // Coût
  cost?: number;
  currency?: string;
  
  // Dates
  attemptedAt: Date;
  completedAt?: Date;
  
  // Suivi
  trackingId?: string;
  deliveryConfirmation?: boolean;
}

export interface NotificationResponse {
  id: string;
  notificationId: string;
  recipientId: string;
  
  // Contenu de la réponse
  content: string;
  responseType: 'text' | 'action' | 'emoji' | 'confirmation';
  
  // Métadonnées
  channel: 'sms' | 'email' | 'in_app';
  language?: string;
  
  // Traitement
  processed: boolean;
  processedAt?: Date;
  processedBy?: string;
  
  // Action déclenchée
  actionTriggered?: string;
  actionResult?: any;
  
  // Sentiment analysis (optionnel)
  sentiment?: 'positive' | 'neutral' | 'negative';
  confidenceScore?: number;
  
  receivedAt: Date;
  createdAt: Date;
}

export interface NotificationRecurrence {
  id: string;
  notificationId: string;
  
  // Type de récurrence
  pattern: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;             // Intervalle entre envois
  
  // Conditions
  maxOccurrences?: number;
  endDate?: Date;
  stopConditions?: string[];    // Conditions d'arrêt
  
  // Progression
  currentOccurrence: number;
  nextSendDate: Date;
  
  // Historique
  previousSends: Date[];
  
  // Statut
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  
  // Contenu du template
  title: string;
  messageTemplate: string;
  shortMessageTemplate?: string;
  
  // Variables disponibles
  availableVariables: string[];
  
  // Configuration par canal
  channelTemplates: {
    sms?: string;
    email?: {
      subject: string;
      htmlBody: string;
      textBody: string;
    };
    push?: {
      title: string;
      body: string;
    };
  };
  
  // Métadonnées
  category: string;
  isActive: boolean;
  isDefault: boolean;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
