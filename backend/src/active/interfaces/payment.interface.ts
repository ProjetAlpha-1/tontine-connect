// backend/src/active/interfaces/payment.interface.ts

export interface Payment {
  // Identifiants
  id: string;
  cycleId: string;
  tontineId: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  
  // Montants et dates
  amount: number;
  expectedAmount: number;       // Montant qui devait être payé
  dueDate: Date;
  paidDate?: Date;              // Date de paiement par le membre
  confirmedDate?: Date;         // Date de confirmation par l'admin
  
  // Statut du paiement
  status: 'pending' | 'paid' | 'confirmed' | 'late' | 'penalty_applied' | 'partial' | 'cancelled';
  
  // Méthode et référence de paiement
  method?: 'cash' | 'bank_transfer' | 'mobile_money' | 'check' | 'other';
  methodDetails?: PaymentMethodDetails;
  reference?: string;           // Référence de transaction
  externalTransactionId?: string;
  
  // Gestion des retards
  daysLate?: number;
  penaltyAmount?: number;
  penaltyApplied: boolean;
  penaltyId?: string;
  
  // Paiements partiels
  isPartialPayment: boolean;
  remainingAmount?: number;
  relatedPayments?: string[];   // IDs des autres paiements partiels
  
  // Validation et confirmation
  requiresConfirmation: boolean;
  confirmedBy?: string;         // ID de l'admin qui a confirmé
  confirmedAt?: Date;
  confirmationMethod?: 'manual' | 'automatic' | 'receipt_verification';
  
  // Preuves et documents
  receipt?: PaymentReceipt;
  attachments?: PaymentAttachment[];
  
  // Notes et commentaires
  notes?: string;
  memberNotes?: string;         // Notes du membre
  adminNotes?: string;          // Notes de l'admin
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  
  // Audit trail
  history: PaymentHistoryEntry[];
}

export interface PaymentMethodDetails {
  // Pour Mobile Money
  mobileMoneyProvider?: 'moov' | 'airtel' | 'other';
  mobileMoneyNumber?: string;
  
  // Pour virement bancaire
  bankName?: string;
  accountNumber?: string;
  
  // Pour chèque
  checkNumber?: string;
  checkBank?: string;
  
  // Autres détails
  additionalInfo?: string;
}

export interface PaymentReceipt {
  id: string;
  paymentId: string;
  
  // Informations du reçu
  receiptNumber: string;
  issueDate: Date;
  
  // Contenu
  amount: number;
  currency: string;
  description: string;
  
  // Émetteur
  issuedBy: string;             // ID de l'admin
  issuerName: string;
  
  // Format et stockage
  format: 'pdf' | 'image' | 'digital';
  fileUrl?: string;
  filePath?: string;
  
  // Signature digitale
  digitalSignature?: string;
  verified: boolean;
  
  createdAt: Date;
}

export interface PaymentAttachment {
  id: string;
  paymentId: string;
  
  // Fichier
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  filePath: string;
  
  // Type d'attachement
  type: 'receipt' | 'bank_statement' | 'screenshot' | 'photo' | 'document' | 'other';
  
  // Description
  title?: string;
  description?: string;
  
  // Métadonnées
  uploadedBy: string;           // ID du membre ou admin
  uploadedAt: Date;
  
  // Validation
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface PaymentHistoryEntry {
  id: string;
  paymentId: string;
  
  // Action effectuée
  action: 'created' | 'updated' | 'confirmed' | 'cancelled' | 'penalty_applied' | 'receipt_added' | 'note_added';
  
  // Détails du changement
  previousStatus?: string;
  newStatus?: string;
  changes?: Record<string, any>;
  
  // Qui a fait l'action
  performedBy: string;          // ID de l'utilisateur
  performerName: string;
  performerRole: 'member' | 'admin' | 'system';
  
  // Quand
  performedAt: Date;
  
  // Pourquoi
  reason?: string;
  notes?: string;
  
  // Contexte supplémentaire
  metadata?: Record<string, any>;
}
