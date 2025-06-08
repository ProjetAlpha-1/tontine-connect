// backend/src/reputation/dto/reputation-update.dto.ts

import { 
  IsString, 
  IsNumber, 
  IsEnum, 
  IsArray, 
  IsBoolean, 
  IsOptional,
  IsDateString,
  IsObject,
  ValidateNested,
  Min,
  Max,
  IsInt,
  Length,
  Matches
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { 
  ReputationEventType,
  EventSeverity,
  BadgeType,
  ReputationLevel,
  ReputationWeight
} from '../types/reputation-types';

/**
 * 🔄 DTOs Actions et Mises à Jour - Système de Réputation - Tontine Connect v0.6.0
 * 
 * Ces DTOs définissent toutes les structures pour créer, modifier et interagir
 * avec le système de réputation (événements, badges, configurations, etc.).
 */

// =====================================
// 📊 CRÉATION D'ÉVÉNEMENTS DE RÉPUTATION
// =====================================

export class CreateReputationEventDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur concerné',
    example: 'user_123456'
  })
  @IsString()
  @Length(1, 50)
  userId: string;

  @ApiProperty({
    description: 'Type d\'événement de réputation',
    enum: ReputationEventType,
    example: ReputationEventType.PAYMENT_ON_TIME
  })
  @IsEnum(ReputationEventType)
  eventType: ReputationEventType;

  @ApiPropertyOptional({
    description: 'ID de la tontine concernée (si applicable)',
    example: 'tontine_123456'
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  tontineId?: string;

  @ApiPropertyOptional({
    description: 'Sévérité de l\'événement',
    enum: EventSeverity,
    default: EventSeverity.MODERATE
  })
  @IsOptional()
  @IsEnum(EventSeverity)
  severity?: EventSeverity = EventSeverity.MODERATE;

  @ApiPropertyOptional({
    description: 'Description personnalisée de l\'événement',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Contexte métier de l\'événement',
    example: 'Cycle 3, Semaine 2'
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  businessContext?: string;

  @ApiPropertyOptional({
    description: 'ID de l\'entité liée (payment, cycle, etc.)',
    example: 'payment_789'
  })
  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @ApiPropertyOptional({
    description: 'Type d\'entité liée',
    example: 'payment'
  })
  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @ApiPropertyOptional({
    description: 'Date d\'occurrence de l\'événement (ISO 8601)',
    example: '2024-01-15T10:30:00Z'
  })
  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @ApiPropertyOptional({
  description: 'Données supplémentaires de l\'événement',
  type: 'object',
  additionalProperties: true,  // ← AJOUTER CETTE LIGNE
  example: { amount: 50000, currency: 'FCFA', method: 'mobile_money' }
})
  @IsOptional()
  @IsObject()
  eventData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Impact manuel sur le score (override automatique)',
    minimum: -1000,
    maximum: 1000
  })
  @IsOptional()
  @IsNumber()
  @Min(-1000)
  @Max(1000)
  manualScoreImpact?: number;

  @ApiPropertyOptional({
    description: 'Tags pour classification',
    isArray: true,
    example: ['urgent', 'verified', 'manual']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Événement vérifié manuellement',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean = false;

  @ApiPropertyOptional({
    description: 'Raison de la création manuelle',
    maxLength: 300
  })
  @IsOptional()
  @IsString()
  @Length(1, 300)
  reason?: string;
}

export class BatchCreateEventsDto {
  @ApiProperty({
    description: 'Liste d\'événements à créer en lot',
    type: [CreateReputationEventDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReputationEventDto)
  events: CreateReputationEventDto[];

  @ApiPropertyOptional({
    description: 'Traitement atomique (tout ou rien)',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  atomic?: boolean = true;

  @ApiPropertyOptional({
    description: 'Déclencher le recalcul automatique',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  triggerRecalculation?: boolean = true;
}

// =====================================
// 🔄 MISE À JOUR D'ÉVÉNEMENTS
// =====================================

export class UpdateReputationEventDto {
  @ApiProperty({
    description: 'ID de l\'événement à modifier',
    example: 'event_123456'
  })
  @IsString()
  eventId: string;

  @ApiPropertyOptional({
    description: 'Nouvelle description',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Nouvelle sévérité',
    enum: EventSeverity
  })
  @IsOptional()
  @IsEnum(EventSeverity)
  severity?: EventSeverity;

  @ApiPropertyOptional({
    description: 'Nouveau statut de vérification'
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Raison de la modification',
    maxLength: 300
  })
  @IsOptional()
  @IsString()
  @Length(1, 300)
  updateReason?: string;

  @ApiPropertyOptional({
    description: 'Métadonnées supplémentaires'
  })
  @IsOptional()
  @IsObject()
  additionalMetadata?: Record<string, any>;
}

export class ReverseReputationEventDto {
  @ApiProperty({
    description: 'ID de l\'événement à annuler',
    example: 'event_123456'
  })
  @IsString()
  eventId: string;

  @ApiProperty({
    description: 'Raison de l\'annulation',
    maxLength: 300,
    example: 'Erreur de saisie - paiement non confirmé'
  })
  @IsString()
  @Length(1, 300)
  reversalReason: string;

  @ApiPropertyOptional({
    description: 'Créer un événement compensatoire',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  createCompensationEvent?: boolean = true;

  @ApiPropertyOptional({
    description: 'Notifier l\'utilisateur',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  notifyUser?: boolean = true;
}

// =====================================
// 🏅 GESTION DES BADGES
// =====================================

export class AwardBadgeDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur',
    example: 'user_123456'
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Type de badge à attribuer',
    enum: BadgeType,
    example: BadgeType.PUNCTUAL_PAYER
  })
  @IsEnum(BadgeType)
  badgeType: BadgeType;

  @ApiProperty({
    description: 'Raison de l\'attribution',
    maxLength: 200,
    example: 'Performance exceptionnelle sur 3 mois'
  })
  @IsString()
  @Length(1, 200)
  reason: string;

  @ApiPropertyOptional({
    description: 'Attribution manuelle par administrateur',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isManualAward?: boolean = false;

  @ApiPropertyOptional({
    description: 'Métadonnées du badge',
    example: { level: 'expert', streak: 30 }
  })
  @IsOptional()
  @IsObject()
  badgeMetadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Badge visible publiquement',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean = true;

  @ApiPropertyOptional({
    description: 'Date d\'attribution personnalisée (ISO 8601)'
  })
  @IsOptional()
  @IsDateString()
  awardedAt?: string;
}

export class RevokeBadgeDto {
  @ApiProperty({
    description: 'ID du badge à révoquer',
    example: 'badge_123456'
  })
  @IsString()
  badgeId: string;

  @ApiProperty({
    description: 'Raison de la révocation',
    maxLength: 200,
    example: 'Conditions non plus remplies'
  })
  @IsString()
  @Length(1, 200)
  revocationReason: string;

  @ApiPropertyOptional({
    description: 'Ajuster le score de réputation',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  adjustReputationScore?: boolean = true;

  @ApiPropertyOptional({
    description: 'Notifier l\'utilisateur',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  notifyUser?: boolean = true;
}

export class UpdateBadgeDto {
  @ApiProperty({
    description: 'ID du badge à modifier',
    example: 'badge_123456'
  })
  @IsString()
  badgeId: string;

  @ApiPropertyOptional({
    description: 'Visibilité du badge'
  })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @ApiPropertyOptional({
    description: 'Badge épinglé'
  })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional({
    description: 'Ordre d\'affichage',
    minimum: 0,
    maximum: 999
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Métadonnées mises à jour'
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// =====================================
// 🔧 AJUSTEMENTS MANUELS DE RÉPUTATION
// =====================================

export class ManualScoreAdjustmentDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur',
    example: 'user_123456'
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Ajustement du score',
    minimum: -500,
    maximum: 500,
    example: 25
  })
  @IsNumber()
  @Min(-500)
  @Max(500)
  scoreAdjustment: number;

  @ApiProperty({
    description: 'Raison de l\'ajustement',
    maxLength: 300,
    example: 'Compensation pour problème technique'
  })
  @IsString()
  @Length(1, 300)
  reason: string;

  @ApiPropertyOptional({
    description: 'Type d\'ajustement',
    enum: ['CORRECTION', 'COMPENSATION', 'PENALTY', 'BONUS', 'MIGRATION'],
    default: 'CORRECTION'
  })
  @IsOptional()
  @IsEnum(['CORRECTION', 'COMPENSATION', 'PENALTY', 'BONUS', 'MIGRATION'])
  adjustmentType?: string = 'CORRECTION';

  @ApiPropertyOptional({
    description: 'Référence externe (ticket, décision, etc.)',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  externalReference?: string;

  @ApiPropertyOptional({
    description: 'Ajustement permanent ou temporaire',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isPermanent?: boolean = true;

  @ApiPropertyOptional({
    description: 'Date d\'expiration (si temporaire)',
    example: '2024-06-01T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'Créer un événement de traçabilité',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  createAuditEvent?: boolean = true;
}

export class BulkScoreAdjustmentDto {
  @ApiProperty({
  description: 'Critères de sélection des utilisateurs',
  type: 'object',
  additionalProperties: true,  // ← AJOUTER CETTE LIGNE
  example: {
    level: 'intermediate',
    region: 'west_africa',
    minScore: 400,
    maxScore: 800
  }
})
  @IsObject()
  selectionCriteria: {
    userIds?: string[];
    level?: ReputationLevel;
    region?: string;
    minScore?: number;
    maxScore?: number;
    tags?: string[];
  };

  @ApiProperty({
    description: 'Ajustement à appliquer',
    minimum: -100,
    maximum: 100
  })
  @IsNumber()
  @Min(-100)
  @Max(100)
  scoreAdjustment: number;

  @ApiProperty({
    description: 'Raison globale de l\'ajustement',
    maxLength: 300
  })
  @IsString()
  @Length(1, 300)
  reason: string;

  @ApiPropertyOptional({
    description: 'Mode d\'application',
    enum: ['IMMEDIATE', 'GRADUAL', 'SCHEDULED'],
    default: 'IMMEDIATE'
  })
  @IsOptional()
  @IsEnum(['IMMEDIATE', 'GRADUAL', 'SCHEDULED'])
  applicationMode?: string = 'IMMEDIATE';

  @ApiPropertyOptional({
    description: 'Date d\'application programmée',
    example: '2024-01-15T09:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({
    description: 'Limite maximum d\'utilisateurs affectés',
    minimum: 1,
    maximum: 10000,
    default: 1000
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  maxAffectedUsers?: number = 1000;
}

// =====================================
// ⚙️ CONFIGURATION DU SYSTÈME
// =====================================

export class UpdateReputationConfigDto {
  @ApiPropertyOptional({
  description: 'Nouveaux poids pour le calcul de réputation',
  type: 'object',
  additionalProperties: true  // ← AJOUTER CETTE LIGNE
})
  @IsOptional()
  @ValidateNested()
  @Type(() => ReputationWeightDto)
  weights?: ReputationWeightDto;

  @ApiPropertyOptional({
  description: 'Nouveaux seuils de niveaux',
  type: 'object',
  additionalProperties: true,  // ← AJOUTER CETTE LIGNE
  example: { SILVER: 200, GOLD: 400, PLATINUM: 650, DIAMOND: 850 }
})
  @IsOptional()
  @IsObject()
  levelThresholds?: Partial<Record<ReputationLevel, number>>;

  @ApiPropertyOptional({
  description: 'Nouveaux impacts d\'événements',
  type: 'object',
  additionalProperties: true,  // ← AJOUTER CETTE LIGNE
  example: { PAYMENT_ON_TIME: 12, PAYMENT_LATE: -18 }
})
  @IsOptional()
  @IsObject()
  eventImpacts?: Partial<Record<ReputationEventType, number>>;

  @ApiPropertyOptional({
    description: 'Fonctionnalités activées',
    isArray: true,
    example: ['temporal_decay', 'peer_comparison', 'predictive_analytics']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enabledFeatures?: string[];

  @ApiPropertyOptional({
    description: 'Raison du changement de configuration',
    maxLength: 300
  })
  @IsOptional()
  @IsString()
  @Length(1, 300)
  changeReason?: string;

  @ApiPropertyOptional({
    description: 'Appliquer immédiatement (sinon planifié)',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  applyImmediately?: boolean = false;

  @ApiPropertyOptional({
    description: 'Date d\'application programmée',
    example: '2024-02-01T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class ReputationWeightDto {
  @ApiPropertyOptional({
    description: 'Poids ponctualité paiements',
    minimum: 0,
    maximum: 1,
    example: 0.35
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  paymentPunctuality?: number;

  @ApiPropertyOptional({
    description: 'Poids taux de participation',
    minimum: 0,
    maximum: 1,
    example: 0.25
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  participationRate?: number;

  @ApiPropertyOptional({
    description: 'Poids taux de complétion',
    minimum: 0,
    maximum: 1,
    example: 0.20
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  completionRate?: number;

  @ApiPropertyOptional({
    description: 'Poids contribution sociale',
    minimum: 0,
    maximum: 1,
    example: 0.10
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  socialContribution?: number;

  @ApiPropertyOptional({
    description: 'Poids points d\'expérience',
    minimum: 0,
    maximum: 1,
    example: 0.05
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  experiencePoints?: number;

  @ApiPropertyOptional({
    description: 'Impact des pénalités',
    minimum: -1,
    maximum: 0,
    example: -0.05
  })
  @IsOptional()
  @IsNumber()
  @Min(-1)
  @Max(0)
  penaltyImpact?: number;
}

// =====================================
// 🔄 RECALCULS ET MAINTENANCE
// =====================================

export class TriggerRecalculationDto {
  @ApiPropertyOptional({
    description: 'Utilisateurs spécifiques à recalculer',
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @ApiPropertyOptional({
    description: 'Recalcul global de tous les utilisateurs',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  globalRecalculation?: boolean = false;

  @ApiPropertyOptional({
    description: 'Forcer le recalcul même si pas nécessaire',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  forceRecalculation?: boolean = false;

  @ApiPropertyOptional({
    description: 'Inclure les tontines dans le recalcul',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  includeTontines?: boolean = false;

  @ApiPropertyOptional({
    description: 'Mode de traitement',
    enum: ['SYNC', 'ASYNC', 'BATCH'],
    default: 'ASYNC'
  })
  @IsOptional()
  @IsEnum(['SYNC', 'ASYNC', 'BATCH'])
  processingMode?: 'SYNC' | 'ASYNC' | 'BATCH' = 'ASYNC';

  @ApiPropertyOptional({
    description: 'Priorité du traitement',
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL'
  })
  @IsOptional()
  @IsEnum(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL';

  @ApiPropertyOptional({
    description: 'Raison du recalcul',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  reason?: string;
}

export class MaintenanceTaskDto {
  @ApiProperty({
    description: 'Type de tâche de maintenance',
    enum: [
      'CLEANUP_EXPIRED_EVENTS', 
      'OPTIMIZE_PERFORMANCE', 
      'REBUILD_INDEXES',
      'ARCHIVE_OLD_DATA',
      'VERIFY_DATA_INTEGRITY',
      'UPDATE_SYSTEM_METRICS'
    ]
  })
  @IsEnum([
    'CLEANUP_EXPIRED_EVENTS', 
    'OPTIMIZE_PERFORMANCE', 
    'REBUILD_INDEXES',
    'ARCHIVE_OLD_DATA',
    'VERIFY_DATA_INTEGRITY',
    'UPDATE_SYSTEM_METRICS'
  ])
  taskType: string;

  @ApiPropertyOptional({
    description: 'Paramètres spécifiques à la tâche',
    example: { olderThanDays: 90, dryRun: true }
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Exécution programmée',
    example: '2024-01-15T02:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({
    description: 'Mode d\'exécution à sec (test)',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean = false;
}

// =====================================
// 📊 ANONYMISATION ET GDPR
// =====================================

export class AnonymizeUserDataDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur à anonymiser',
    example: 'user_123456'
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Raison de l\'anonymisation',
    maxLength: 300,
    example: 'Demande GDPR - droit à l\'oubli'
  })
  @IsString()
  @Length(1, 300)
  reason: string;

  @ApiPropertyOptional({
    description: 'Conserver les données agrégées anonymes',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  retainAggregatedData?: boolean = true;

  @ApiPropertyOptional({
    description: 'Conserver l\'historique des scores (anonymisé)',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  retainScoreHistory?: boolean = true;

  @ApiPropertyOptional({
    description: 'Notifier les parties prenantes',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  notifyStakeholders?: boolean = false;

  @ApiPropertyOptional({
    description: 'Référence légale',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  legalReference?: string;
}

// =====================================
// 🎯 ACTIONS SPÉCIALISÉES
// =====================================

export class DisputeEventDto {
  @ApiProperty({
    description: 'ID de l\'événement disputé',
    example: 'event_123456'
  })
  @IsString()
  eventId: string;

  @ApiProperty({
    description: 'Raison de la dispute',
    maxLength: 500,
    example: 'Le paiement a été effectué à temps mais marqué en retard'
  })
  @IsString()
  @Length(1, 500)
  disputeReason: string;

  @ApiPropertyOptional({
    description: 'Preuves supplémentaires',
    isArray: true,
    example: ['receipt_url', 'witness_statement']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidence?: string[];

  @ApiPropertyOptional({
    description: 'Contact pour résolution',
    example: 'user@email.com'
  })
  @IsOptional()
  @IsString()
  contactInfo?: string;
}

export class ResolveDisputeDto {
  @ApiProperty({
    description: 'ID de l\'événement disputé',
    example: 'event_123456'
  })
  @IsString()
  eventId: string;

  @ApiProperty({
    description: 'Résolution de la dispute',
    enum: ['APPROVED', 'REJECTED', 'MODIFIED', 'ESCALATED'],
    example: 'APPROVED'
  })
  @IsEnum(['APPROVED', 'REJECTED', 'MODIFIED', 'ESCALATED'])
  resolution: 'APPROVED' | 'REJECTED' | 'MODIFIED' | 'ESCALATED';

  @ApiProperty({
    description: 'Explication de la résolution',
    maxLength: 500,
    example: 'Après vérification, le paiement était effectivement à temps'
  })
  @IsString()
  @Length(1, 500)
  resolutionExplanation: string;

  @ApiPropertyOptional({
    description: 'Ajustement de score si nécessaire',
    minimum: -100,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(-100)
  @Max(100)
  scoreAdjustment?: number;

  @ApiPropertyOptional({
    description: 'ID du médiateur/administrateur'
  })
  @IsOptional()
  @IsString()
  resolvedBy?: string;
}

// =====================================
// 📋 RÉPONSES STANDARDISÉES
// =====================================

export class ReputationActionResponseDto {
  @ApiProperty({ description: 'Succès de l\'opération' })
  success: boolean;

  @ApiProperty({ description: 'Message de statut' })
  message: string;

  @ApiProperty({ description: 'ID de l\'action effectuée' })
  actionId: string;

  @ApiProperty({ description: 'Données résultantes' })
  data?: any;

  @ApiProperty({ description: 'Impact sur le score' })
  scoreImpact?: {
    oldScore: number;
    newScore: number;
    change: number;
    levelChanged: boolean;
  };

  @ApiProperty({ description: 'Métadonnées de l\'action' })
  metadata: {
    executedAt: Date;
    executedBy: string;
    processingTime: number;
    affectedEntities: string[];
  };
} 
