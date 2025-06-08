// backend/src/reputation/interfaces/reputation-event.interface.ts

import { 
  ReputationEventType, 
  EventCategory,
  ReputationLevel 
} from '../types/reputation-types';

/**
 * 📊 Interface des Événements de Réputation - Tontine Connect v0.6.0
 * 
 * Cette interface définit tous les événements qui peuvent impacter la réputation
 * des utilisateurs et des tontines, avec leur traçabilité complète.
 */

// =====================================
// 📊 ÉVÉNEMENT DE RÉPUTATION PRINCIPAL
// =====================================

export interface IReputationEvent {
  // Identification unique
  id: string;
  eventCode: string;                // Code unique pour l'événement (ex: PAY_001, PEN_002)
  
  // Acteurs concernés
  userId: string;                   // Utilisateur principal concerné
  affectedUserIds?: string[];       // Autres utilisateurs impactés
  tontineId?: string;              // Tontine concernée (si applicable)
  
  // Type et classification
  type: ReputationEventType;        // Type d'événement
  category: EventCategory;          // Catégorie pour le calcul
  severity: EventSeverity;          // Sévérité de l'événement
  
  // =====================================
  // 💥 IMPACT SUR LA RÉPUTATION
  // =====================================
  
  // Impact principal
  scoreImpact: number;              // Impact sur le score (-1000 à +1000)
  baseImpact: number;               // Impact de base avant multiplicateurs
  finalImpact: number;              // Impact final après tous les calculs
  
  // Détails de calcul
  multipliers: IEventMultipliers;   // Tous les multiplicateurs appliqués
  contextualFactors: IContextualFactors; // Facteurs contextuels
  
  // Impact par catégorie
  categoryImpacts: {
    payment: number;                // Impact sur la catégorie paiement
    participation: number;          // Impact sur la participation
    social: number;                 // Impact social
    experience: number;             // Impact sur l'expérience
    penalty: number;                // Impact des pénalités
  };
  
  // =====================================
  // 📝 DESCRIPTION ET CONTEXTE
  // =====================================
  
  // Description
  title: string;                    // Titre court de l'événement
  description: string;              // Description détaillée
  shortDescription: string;         // Description courte pour notifications
  
  // Contexte métier
  businessContext: string;          // Contexte business (ex: "Cycle 3, Semaine 2")
  relatedEntityId?: string;         // ID de l'entité liée (payment, cycle, etc.)
  relatedEntityType?: string;       // Type d'entité (payment, penalty, etc.)
  
  // Données spécifiques
  eventData: Record<string, any>;   // Données spécifiques à l'événement
  metadata: IEventMetadata;         // Métadonnées enrichies
  
  // =====================================
  // ⏰ GESTION TEMPORELLE
  // =====================================
  
  // Horodatage
  occurredAt: Date;                 // Quand l'événement s'est produit
  detectedAt: Date;                 // Quand l'événement a été détecté
  processedAt: Date;                // Quand l'événement a été traité
  acknowledgedAt?: Date;            // Quand l'utilisateur a été notifié
  
  // Durée et timing
  processingDuration: number;       // Temps de traitement en millisecondes
  delayFromOccurrence: number;      // Délai entre occurrence et détection (ms)
  
  // Expiration et persistance
  expiresAt?: Date;                 // Date d'expiration (pour impacts temporaires)
  isTemporary: boolean;             // Impact temporaire ou permanent
  decayRate?: number;               // Taux de décroissance si applicable
  
  // =====================================
  // 🔍 VALIDATION ET VÉRIFICATION
  // =====================================
  
  // Statut de validation
  isVerified: boolean;              // Événement vérifié
  verificationLevel: VerificationLevel; // Niveau de vérification
  verificationMethod: string;       // Méthode de vérification utilisée
  
  // Détails de vérification
  verifiedBy?: string;              // ID du vérificateur
  verificationDate?: Date;          // Date de vérification
  verificationProof?: string;       // Preuve de vérification
  verificationScore: number;        // Score de confiance (0-100%)
  
  // Validation automatique
  autoValidated: boolean;           // Validé automatiquement
  validationRules: string[];        // Règles de validation appliquées
  validationErrors: string[];       // Erreurs de validation
  
  // =====================================
  // 🔄 GESTION DES ANNULATIONS
  // =====================================
  
  // Statut d'annulation
  isReversed: boolean;              // Événement annulé
  canBeReversed: boolean;           // Peut être annulé
  reversalDeadline?: Date;          // Délai limite pour annulation
  
  // Détails d'annulation
  reversalReason?: string;          // Raison de l'annulation
  reversedAt?: Date;                // Date d'annulation
  reversedBy?: string;              // ID de celui qui a annulé
  reversalEventId?: string;         // ID de l'événement d'annulation
  
  // Impact de l'annulation
  reversalImpact: number;           // Impact de l'annulation sur le score
  compensationGiven: boolean;       // Compensation accordée
  
  // =====================================
  // 🚨 GESTION D'ERREURS ET DISPUTES
  // =====================================
  
  // Statut d'erreur
  hasErrors: boolean;               // Événement avec erreurs
  errorMessages: string[];          // Messages d'erreur
  errorCode?: string;               // Code d'erreur spifique
  
  // Disputes et contestations
  isDisputed: boolean;              // Événement contesté
  disputeReason?: string;           // Raison de la contestation
  disputedAt?: Date;                // Date de contestation
  disputedBy?: string;              // ID du contestant
  
  // Résolution de dispute
  disputeResolution?: string;       // Résolution de la dispute
  disputeResolvedAt?: Date;         // Date de résolution
  disputeResolvedBy?: string;       // ID du résolveur
  
  // =====================================
  // 🔗 RELATIONS ET HIÉRARCHIE
  // =====================================
  
  // Relations avec d'autres événements
  parentEventId?: string;           // Événement parent
  childEventIds: string[];          // Événements enfants
  relatedEventIds: string[];        // Événements liés
  
  // Groupement et séquences
  eventGroupId?: string;            // Groupe d'événements liés
  sequenceNumber?: number;          // Numéro dans une séquence
  batchId?: string;                 // ID de lot pour traitement en masse
  
  // Causalité
  triggerEventId?: string;          // Événement déclencheur
  consequenceEventIds: string[];    // Événements conséquents
  
  // =====================================
  // 🎯 CIBLAGE ET FILTRAGE
  // =====================================
  
  // Ciblage
  targetAudience: string[];         // Public cible pour notifications
  visibilityLevel: VisibilityLevel; // Niveau de visibilité
  
  // Tags et labels
  tags: string[];                   // Tags pour classification
  labels: Record<string, string>;   // Labels clé-valeur
  
  // Filtres
  isPublic: boolean;                // Visible publiquement
  isInternal: boolean;              // Usage interne seulement
  isSensitive: boolean;             // Données sensibles
  
  // =====================================
  // 📈 ANALYTICS ET MÉTRIQUES
  // =====================================
  
  // Métriques de performance
  impactEffectiveness: number;      // Efficacité de l'impact (0-100%)
  userReaction?: UserReaction;      // Réaction de l'utilisateur
  behaviorChange?: number;          // Changement de comportement observé
  
  // Analyse prédictive
  predictedFutureImpact: number;    // Impact futur prédit
  influenceScore: number;           // Score d'influence sur les autres
  viralityPotential: number;        // Potentiel de propagation
  
  // Contexte algorithmique
  algorithmVersion: string;         // Version de l'algorithme utilisé
  calculationMethod: string;        // Méthode de calcul utilisée
  confidenceLevel: number;          // Niveau de confiance (0-100%)
  
  // =====================================
  // 🔧 MÉTADONNÉES TECHNIQUES
  // =====================================
  
  // Source et origine
  source: EventSource;              // Source de l'événement
  sourceSystem: string;             // Système source
  sourceVersion: string;            // Version du système source
  
  // Traçabilité technique
  traceId: string;                  // ID de trace pour debugging
  correlationId: string;            // ID de corrélation
  sessionId?: string;               // ID de session utilisateur
  
  // Qualité des données
  dataQuality: number;              // Qualité des données (0-100%)
  completeness: number;             // Complétude des données (0-100%)
  reliability: number;              // Fiabilité des données (0-100%)
  
  // Audit et conformité
  auditTrail: IAuditEntry[];        // Piste d'audit
  complianceFlags: string[];        // Flags de conformité
  privacyLevel: PrivacyLevel;       // Niveau de confidentialité
  
  // Métadonnées système
  createdAt: Date;                  // Date de création
  updatedAt: Date;                  // Dernière mise à jour
  version: number;                  // Version pour optimistic locking
}

// =====================================
// 🎯 INTERFACES SUPPLÉMENTAIRES
// =====================================

export interface IEventMultipliers {
  firstTime: number;                // Multiplicateur première fois
  consecutive: number;              // Multiplicateur événements consécutifs
  frequency: number;                // Multiplicateur de fréquence
  recency: number;                  // Multiplicateur de récence
  severity: number;                 // Multiplicateur de sévérité
  userLevel: number;                // Multiplicateur selon niveau utilisateur
  tontineHealth: number;            // Multiplicateur selon santé tontine
  seasonal: number;                 // Multiplicateur saisonnier
  contextual: number;               // Multiplicateur contextuel
  final: number;                    // Multiplicateur final appliqué
}

export interface IContextualFactors {
  userReputationLevel: ReputationLevel; // Niveau de réputation de l'utilisateur
  userRiskLevel: string;            // Niveau de risque utilisateur
  tontineHealthScore?: number;      // Score de santé de la tontine
  cycleStage: string;               // Étape du cycle
  dayOfWeek: string;                // Jour de la semaine
  timeOfDay: string;                // Moment de la journée
  memberCount?: number;             // Nombre de membres dans la tontine
  cycleDuration?: number;           // Durée du cycle en cours
  previousEvents: number;           // Nombre d'événements similaires récents
}

export interface IEventMetadata {
  // Données techniques
  deviceInfo?: string;              // Informations sur l'appareil
  ipAddress?: string;               // Adresse IP
  userAgent?: string;               // User Agent
  location?: string;                // Localisation
  
  // Données business
  amount?: number;                  // Montant (si applicable)
  currency?: string;                // Devise
  paymentMethod?: string;           // Méthode de paiement
  
  // Contexte de la tontine
  cycleNumber?: number;             // Numéro du cycle
  weekNumber?: number;              // Numéro de la semaine
  expectedDate?: Date;              // Date attendue
  actualDate?: Date;                // Date réelle
  
  // Données sociales
  witnessIds?: string[];            // Témoins de l'événement
  endorsements?: number;            // Nombre d'endorsements
  reactions?: Record<string, number>; // Réactions des autres membres
}

// =====================================
// 📊 ENUMS POUR LES ÉVÉNEMENTS
// =====================================

export enum EventSeverity {
  MINOR = 'MINOR',                  // Impact mineur
  MODERATE = 'MODERATE',            // Impact modéré
  MAJOR = 'MAJOR',                  // Impact majeur
  CRITICAL = 'CRITICAL',            // Impact critique
  EXCEPTIONAL = 'EXCEPTIONAL'       // Impact exceptionnel
}

export enum VerificationLevel {
  NONE = 'NONE',                    // Pas de vérification
  BASIC = 'BASIC',                  // Vérification basique
  STANDARD = 'STANDARD',            // Vérification standard
  ENHANCED = 'ENHANCED',            // Vérification renforcée
  MANUAL = 'MANUAL'                 // Vérification manuelle
}

export enum VisibilityLevel {
  PRIVATE = 'PRIVATE',              // Privé (utilisateur uniquement)
  GROUP = 'GROUP',                  // Groupe (membres de la tontine)
  PUBLIC = 'PUBLIC',                // Public (tous les utilisateurs)
  SYSTEM = 'SYSTEM'                 // Système (administrateurs)
}

export enum EventSource {
  USER_ACTION = 'USER_ACTION',      // Action utilisateur directe
  SYSTEM_AUTOMATIC = 'SYSTEM_AUTOMATIC', // Automatique système
  ADMIN_MANUAL = 'ADMIN_MANUAL',    // Action administrative manuelle
  EXTERNAL_API = 'EXTERNAL_API',    // API externe
  BATCH_PROCESS = 'BATCH_PROCESS',  // Traitement par lot
  SCHEDULED_JOB = 'SCHEDULED_JOB'   // Tâche programmée
}

export enum UserReaction {
  POSITIVE = 'POSITIVE',            // Réaction positive
  NEUTRAL = 'NEUTRAL',              // Réaction neutre
  NEGATIVE = 'NEGATIVE',            // Réaction négative
  DISPUTED = 'DISPUTED',            // Contesté
  ACKNOWLEDGED = 'ACKNOWLEDGED'     // Acquitté
}

export enum PrivacyLevel {
  PUBLIC = 'PUBLIC',                // Données publiques
  INTERNAL = 'INTERNAL',            // Usage interne
  CONFIDENTIAL = 'CONFIDENTIAL',    // Confidentiel
  RESTRICTED = 'RESTRICTED',        // Accès restreint
  SECRET = 'SECRET'                 // Secret
}

// =====================================
// 🔍 INTERFACES DE REQUÊTE
// =====================================

export interface IReputationEventQuery {
  userId?: string;
  tontineId?: string;
  eventTypes?: ReputationEventType[];
  categories?: EventCategory[];
  severities?: EventSeverity[];
  dateFrom?: Date;
  dateTo?: Date;
  isVerified?: boolean;
  isDisputed?: boolean;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface IAuditEntry {
  timestamp: Date;
  action: string;
  performedBy: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress?: string;
  sessionId?: string;
} 
