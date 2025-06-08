// backend/src/reputation/dto/reputation-query.dto.ts

import { 
  IsOptional, 
  IsString, 
  IsNumber, 
  IsEnum, 
  IsArray, 
  IsBoolean, 
  IsDateString,
  IsInt,
  Min,
  Max,
  ValidateNested,
  IsObject
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { 
  ReputationLevel, 
  ReputationEventType,
  BadgeType,
  RiskLevel,
  TrustLevel,
  TrendDirection,
  EventCategory,
  EventSeverity,
  TrendPeriod
} from '../types/reputation-types';

/**
 * 📊 DTOs de Requêtes et Filtres - Système de Réputation - Tontine Connect v0.6.0
 * 
 * Ces DTOs définissent toutes les structures de données pour les requêtes,
 * filtres, recherches et paramètres d'API du système de réputation.
 */

// =====================================
// 👤 DTOs RÉPUTATION UTILISATEUR
// =====================================

export class GetUserReputationDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur',
    example: 'user_123456'
  })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'Inclure les badges dans la réponse',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeBadges?: boolean = true;

  @ApiPropertyOptional({
    description: 'Inclure les achievements dans la réponse',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeAchievements?: boolean = true;

  @ApiPropertyOptional({
    description: 'Inclure les tendances dans la réponse',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeTrends?: boolean = false;

  @ApiPropertyOptional({
    description: 'Période d\'analyse des tendances en jours',
    minimum: 7,
    maximum: 365,
    default: 30
  })
  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(365)
  @Transform(({ value }) => parseInt(value))
  trendPeriod?: number = 30;
}

export class UserReputationQueryDto {
  @ApiPropertyOptional({
    description: 'Score minimum',
    minimum: 0,
    maximum: 1000
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  @Transform(({ value }) => parseFloat(value))
  minScore?: number;

  @ApiPropertyOptional({
    description: 'Score maximum',
    minimum: 0,
    maximum: 1000
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  @Transform(({ value }) => parseFloat(value))
  maxScore?: number;

  @ApiPropertyOptional({
    description: 'Niveaux de réputation à inclure',
    enum: ReputationLevel,
    isArray: true,
    example: [ReputationLevel.GOLD, ReputationLevel.PLATINUM]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ReputationLevel, { each: true })
  levels?: ReputationLevel[];

  @ApiPropertyOptional({
    description: 'Niveaux de risque à inclure',
    enum: RiskLevel,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsEnum(RiskLevel, { each: true })
  riskLevels?: RiskLevel[];

  @ApiPropertyOptional({
    description: 'Région géographique',
    example: 'Libreville'
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'Utilisateurs actifs uniquement',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  activeOnly?: boolean = true;

  @ApiPropertyOptional({
    description: 'Utilisateurs vérifiés uniquement',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  verifiedOnly?: boolean = false;

  @ApiPropertyOptional({
    description: 'Ancienneté minimum en jours',
    minimum: 0
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  minMembershipDays?: number;

  @ApiPropertyOptional({
    description: 'Nombre minimum de tontines complétées',
    minimum: 0
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  minCompletedTontines?: number;

  @ApiPropertyOptional({
    description: 'Badges requis',
    enum: BadgeType,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsEnum(BadgeType, { each: true })
  requiredBadges?: BadgeType[];

  @ApiPropertyOptional({
    description: 'Nombre de résultats par page',
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Décalage pour la pagination',
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    enum: ['score', 'level', 'membershipDuration', 'completedTontines', 'lastActivity'],
    default: 'score'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'score';

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    enum: ['ASC', 'DESC'],
    default: 'DESC'
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// =====================================
// 🏛️ DTOs RÉPUTATION TONTINE
// =====================================

export class GetTontineReputationDto {
  @ApiProperty({
    description: 'ID de la tontine',
    example: 'tontine_123456'
  })
  @IsString()
  tontineId: string;

  @ApiPropertyOptional({
    description: 'Inclure l\'historique de performance',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeHistory?: boolean = false;

  @ApiPropertyOptional({
    description: 'Inclure les facteurs de risque',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeRiskFactors?: boolean = true;

  @ApiPropertyOptional({
    description: 'Inclure les recommandations',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeRecommendations?: boolean = true;

  @ApiPropertyOptional({
    description: 'Inclure la comparaison avec pairs',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includePeerComparison?: boolean = false;
}

export class TontineReputationQueryDto {
  @ApiPropertyOptional({
    description: 'Score de santé minimum',
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  minHealthScore?: number;

  @ApiPropertyOptional({
    description: 'Score de santé maximum',
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  maxHealthScore?: number;

  @ApiPropertyOptional({
    description: 'Niveaux de confiance à inclure',
    enum: TrustLevel,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsEnum(TrustLevel, { each: true })
  trustLevels?: TrustLevel[];

  @ApiPropertyOptional({
    description: 'Nombre minimum de membres',
    minimum: 2
  })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Transform(({ value }) => parseInt(value))
  minMembers?: number;

  @ApiPropertyOptional({
    description: 'Nombre maximum de membres',
    minimum: 2
  })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Transform(({ value }) => parseInt(value))
  maxMembers?: number;

  @ApiPropertyOptional({
    description: 'Nombre minimum de cycles complétés',
    minimum: 0
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  minCompletedCycles?: number;

  @ApiPropertyOptional({
    description: 'Tontines actives uniquement',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  activeOnly?: boolean = true;

  @ApiPropertyOptional({
    description: 'Age minimum de la tontine en jours',
    minimum: 0
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  minAge?: number;

  @ApiPropertyOptional({
    description: 'Région géographique',
    example: 'Libreville'
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'Recherche par nom de tontine',
    example: 'Épargne'
  })
  @IsOptional()
  @IsString()
  nameSearch?: string;

  @ApiPropertyOptional({
    description: 'Nombre de résultats par page',
    minimum: 1,
    maximum: 50,
    default: 20
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Décalage pour la pagination',
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    enum: ['healthScore', 'trustLevel', 'memberCount', 'completedCycles', 'createdAt'],
    default: 'healthScore'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'healthScore';

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    enum: ['ASC', 'DESC'],
    default: 'DESC'
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// =====================================
// 📊 DTOs ÉVÉNEMENTS DE RÉPUTATION
// =====================================

export class ReputationEventQueryDto {
  @ApiPropertyOptional({
    description: 'ID de l\'utilisateur concerné'
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'ID de la tontine concernée'
  })
  @IsOptional()
  @IsString()
  tontineId?: string;

  @ApiPropertyOptional({
    description: 'Types d\'événements à inclure',
    enum: ReputationEventType,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ReputationEventType, { each: true })
  eventTypes?: ReputationEventType[];

  @ApiPropertyOptional({
    description: 'Catégories d\'événements à inclure',
    enum: EventCategory,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsEnum(EventCategory, { each: true })
  categories?: EventCategory[];

  @ApiPropertyOptional({
    description: 'Niveaux de sévérité à inclure',
    enum: EventSeverity,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsEnum(EventSeverity, { each: true })
  severities?: EventSeverity[];

  @ApiPropertyOptional({
    description: 'Date de début (ISO 8601)',
    example: '2024-01-01T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Date de fin (ISO 8601)',
    example: '2024-12-31T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Impact minimum sur le score',
    minimum: -1000,
    maximum: 1000
  })
  @IsOptional()
  @IsNumber()
  @Min(-1000)
  @Max(1000)
  @Transform(({ value }) => parseFloat(value))
  minImpact?: number;

  @ApiPropertyOptional({
    description: 'Impact maximum sur le score',
    minimum: -1000,
    maximum: 1000
  })
  @IsOptional()
  @IsNumber()
  @Min(-1000)
  @Max(1000)
  @Transform(({ value }) => parseFloat(value))
  maxImpact?: number;

  @ApiPropertyOptional({
    description: 'Événements vérifiés uniquement',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  verifiedOnly?: boolean = false;

  @ApiPropertyOptional({
    description: 'Événements avec erreurs uniquement',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  errorsOnly?: boolean = false;

  @ApiPropertyOptional({
    description: 'Événements disputés uniquement',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  disputedOnly?: boolean = false;

  @ApiPropertyOptional({
    description: 'Tags à rechercher',
    isArray: true,
    example: ['payment', 'urgent']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Nombre de résultats par page',
    minimum: 1,
    maximum: 100,
    default: 50
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Décalage pour la pagination',
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    enum: ['occurredAt', 'processedAt', 'scoreImpact', 'severity'],
    default: 'occurredAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'occurredAt';

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    enum: ['ASC', 'DESC'],
    default: 'DESC'
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// =====================================
// 📈 DTOs MÉTRIQUES ET ANALYTICS
// =====================================

export class MetricsQueryDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur',
    example: 'user_123456'
  })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'Inclure les prédictions',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includePredictions?: boolean = true;

  @ApiPropertyOptional({
    description: 'Inclure les comparaisons détaillées',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeComparisons?: boolean = true;

  @ApiPropertyOptional({
    description: 'Inclure les insights avancés',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeInsights?: boolean = true;

  @ApiPropertyOptional({
    description: 'Inclure les recommandations',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeRecommendations?: boolean = true;

  @ApiPropertyOptional({
    description: 'Période d\'analyse en jours',
    minimum: 7,
    maximum: 365,
    default: 90
  })
  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(365)
  @Transform(({ value }) => parseInt(value))
  analysisPeriod?: number = 90;
}

export class TrendAnalysisDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur ou de la tontine'
  })
  @IsString()
  entityId: string;

  @ApiProperty({
    description: 'Type d\'entité',
    enum: ['USER', 'TONTINE']
  })
  @IsEnum(['USER', 'TONTINE'])
  entityType: 'USER' | 'TONTINE';

  @ApiPropertyOptional({
    description: 'Période d\'analyse',
    enum: TrendPeriod,
    default: TrendPeriod.MONTHLY
  })
  @IsOptional()
  @IsEnum(TrendPeriod)
  period?: TrendPeriod = TrendPeriod.MONTHLY;

  @ApiPropertyOptional({
    description: 'Nombre de périodes à analyser',
    minimum: 1,
    maximum: 52,
    default: 12
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(52)
  @Transform(({ value }) => parseInt(value))
  periodCount?: number = 12;

  @ApiPropertyOptional({
    description: 'Inclure les prédictions futures',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includePredictions?: boolean = true;

  @ApiPropertyOptional({
    description: 'Niveau de détail des prédictions',
    minimum: 1,
    maximum: 12,
    default: 3
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Transform(({ value }) => parseInt(value))
  predictionHorizon?: number = 3;
}

// =====================================
// 🏅 DTOs BADGES ET ACCOMPLISSEMENTS
// =====================================

export class BadgeQueryDto {
  @ApiPropertyOptional({
    description: 'ID de l\'utilisateur'
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Types de badges à inclure',
    enum: BadgeType,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsEnum(BadgeType, { each: true })
  badgeTypes?: BadgeType[];

  @ApiPropertyOptional({
    description: 'Catégories de badges',
    isArray: true,
    example: ['PERFORMANCE', 'LOYALTY']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({
    description: 'Badges actifs uniquement',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  activeOnly?: boolean = true;

  @ApiPropertyOptional({
    description: 'Badges visibles uniquement',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  visibleOnly?: boolean = true;

  @ApiPropertyOptional({
    description: 'Date de début pour les badges obtenus',
    example: '2024-01-01'
  })
  @IsOptional()
  @IsDateString()
  awardedFrom?: string;

  @ApiPropertyOptional({
    description: 'Date de fin pour les badges obtenus',
    example: '2024-12-31'
  })
  @IsOptional()
  @IsDateString()
  awardedTo?: string;
}

export class AvailableBadgesDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur',
    example: 'user_123456'
  })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'Inclure uniquement les badges atteignables',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  achievableOnly?: boolean = true;

  @ApiPropertyOptional({
    description: 'Niveau de difficulté maximum',
    enum: ['EASY', 'MEDIUM', 'HARD', 'EXPERT'],
    default: 'HARD'
  })
  @IsOptional()
  @IsEnum(['EASY', 'MEDIUM', 'HARD', 'EXPERT'])
  maxDifficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT' = 'HARD';

  @ApiPropertyOptional({
    description: 'Délai maximum estimé en jours',
    minimum: 1,
    maximum: 365,
    default: 90
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  @Transform(({ value }) => parseInt(value))
  maxEstimatedDays?: number = 90;
}

// =====================================
// 🔍 DTOs RECHERCHE ET COMPARAISON
// =====================================

export class UserComparisonDto {
  @ApiProperty({
    description: 'ID du premier utilisateur',
    example: 'user_123456'
  })
  @IsString()
  userId1: string;

  @ApiProperty({
    description: 'ID du deuxième utilisateur',
    example: 'user_789012'
  })
  @IsString()
  userId2: string;

  @ApiPropertyOptional({
    description: 'Inclure l\'analyse détaillée',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeAnalysis?: boolean = true;

  @ApiPropertyOptional({
    description: 'Inclure les recommandations croisées',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeRecommendations?: boolean = true;
}

export class LeaderboardQueryDto {
  @ApiPropertyOptional({
    description: 'Type de classement',
    enum: ['GLOBAL', 'REGIONAL', 'CATEGORY', 'TONTINE'],
    default: 'GLOBAL'
  })
  @IsOptional()
  @IsEnum(['GLOBAL', 'REGIONAL', 'CATEGORY', 'TONTINE'])
  type?: 'GLOBAL' | 'REGIONAL' | 'CATEGORY' | 'TONTINE' = 'GLOBAL';

  @ApiPropertyOptional({
    description: 'Région pour classement régional',
    example: 'Libreville'
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'Catégorie pour classement par catégorie',
    example: 'GOLD_USERS'
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'ID de la tontine pour classement interne',
    example: 'tontine_123456'
  })
  @IsOptional()
  @IsString()
  tontineId?: string;

  @ApiPropertyOptional({
    description: 'Période pour le classement',
    enum: ['ALL_TIME', 'YEAR', 'MONTH', 'WEEK'],
    default: 'ALL_TIME'
  })
  @IsOptional()
  @IsEnum(['ALL_TIME', 'YEAR', 'MONTH', 'WEEK'])
  period?: 'ALL_TIME' | 'YEAR' | 'MONTH' | 'WEEK' = 'ALL_TIME';

  @ApiPropertyOptional({
    description: 'Nombre de positions à retourner',
    minimum: 1,
    maximum: 100,
    default: 50
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Position de départ',
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  startRank?: number = 1;

  @ApiPropertyOptional({
    description: 'Inclure le contexte utilisateur demandeur'
  })
  @IsOptional()
  @IsString()
  requestingUserId?: string;
}

// =====================================
// 📊 DTOs SIMULATION ET PRÉDICTION
// =====================================

export class ScoreSimulationDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur',
    example: 'user_123456'
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Actions à simuler',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        type: { enum: Object.values(ReputationEventType) },
        count: { type: 'number', minimum: 1 },
        timeframe: { type: 'number', minimum: 1 }
      }
    }
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimulationActionDto)
  actions: SimulationActionDto[];

  @ApiPropertyOptional({
    description: 'Inclure l\'analyse détaillée',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeAnalysis?: boolean = true;
}

export class SimulationActionDto {
  @ApiProperty({
    description: 'Type d\'événement à simuler',
    enum: ReputationEventType
  })
  @IsEnum(ReputationEventType)
  type: ReputationEventType;

  @ApiProperty({
    description: 'Nombre d\'occurrences',
    minimum: 1,
    maximum: 100
  })
  @IsInt()
  @Min(1)
  @Max(100)
  count: number;

  @ApiProperty({
    description: 'Période en jours',
    minimum: 1,
    maximum: 365
  })
  @IsInt()
  @Min(1)
  @Max(365)
  timeframe: number;

  @ApiPropertyOptional({
    description: 'Sévérité de l\'événement',
    enum: EventSeverity,
    default: EventSeverity.MODERATE
  })
  @IsOptional()
  @IsEnum(EventSeverity)
  severity?: EventSeverity = EventSeverity.MODERATE;

  @ApiPropertyOptional({
  description: 'Contexte additionnel pour la simulation',
  type: 'object',
  additionalProperties: true
})
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

// =====================================
// 🔧 DTOs CONFIGURATION ET ADMIN
// =====================================

export class SystemMetricsQueryDto {
  @ApiPropertyOptional({
    description: 'Période d\'analyse en heures',
    minimum: 1,
    maximum: 168,
    default: 24
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168)
  @Transform(({ value }) => parseInt(value))
  timeframe?: number = 24;

  @ApiPropertyOptional({
    description: 'Inclure les détails par composant',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeComponents?: boolean = true;

  @ApiPropertyOptional({
    description: 'Inclure les alertes actives',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeAlerts?: boolean = true;

  @ApiPropertyOptional({
    description: 'Niveau de détail',
    enum: ['BASIC', 'DETAILED', 'COMPREHENSIVE'],
    default: 'DETAILED'
  })
  @IsOptional()
  @IsEnum(['BASIC', 'DETAILED', 'COMPREHENSIVE'])
  detailLevel?: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE' = 'DETAILED';
}

export class AnomalyDetectionDto {
  @ApiPropertyOptional({
    description: 'Période d\'analyse en jours',
    minimum: 1,
    maximum: 90,
    default: 30
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  @Transform(({ value }) => parseInt(value))
  timeframe?: number = 30;

  @ApiPropertyOptional({
    description: 'Utilisateurs spécifiques à analyser',
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @ApiPropertyOptional({
    description: 'Seuil de sensibilité',
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  sensitivity?: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';

  @ApiPropertyOptional({
    description: 'Types d\'anomalies à détecter',
    isArray: true,
    enum: ['SUDDEN_DROP', 'UNUSUAL_SPIKE', 'INCONSISTENT_PATTERN', 'SUSPICIOUS_ACTIVITY']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['SUDDEN_DROP', 'UNUSUAL_SPIKE', 'INCONSISTENT_PATTERN', 'SUSPICIOUS_ACTIVITY'], { each: true })
  anomalyTypes?: string[];

  @ApiPropertyOptional({
    description: 'Inclure uniquement les anomalies de sévérité élevée',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  highSeverityOnly?: boolean = false;
}

export class AuditReportDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur à auditer',
    example: 'user_123456'
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Date de début de la période d\'audit',
    example: '2024-01-01T00:00:00Z'
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Date de fin de la période d\'audit',
    example: '2024-12-31T23:59:59Z'
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Inclure l\'analyse de conformité',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeCompliance?: boolean = true;

  @ApiPropertyOptional({
    description: 'Inclure les détails des calculs',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeCalculationDetails?: boolean = true;

  @ApiPropertyOptional({
    description: 'Inclure les recommandations',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeRecommendations?: boolean = true;

  @ApiPropertyOptional({
    description: 'Format du rapport',
    enum: ['JSON', 'PDF', 'CSV'],
    default: 'JSON'
  })
  @IsOptional()
  @IsEnum(['JSON', 'PDF', 'CSV'])
  format?: 'JSON' | 'PDF' | 'CSV' = 'JSON';
}

// =====================================
// 📊 DTOs EXPORT ET IMPORT
// =====================================

export class DataExportDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur',
    example: 'user_123456'
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Format d\'export',
    enum: ['JSON', 'CSV', 'PDF'],
    example: 'JSON'
  })
  @IsEnum(['JSON', 'CSV', 'PDF'])
  format: 'JSON' | 'CSV' | 'PDF';

  @ApiPropertyOptional({
    description: 'Inclure les données de réputation',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeReputation?: boolean = true;

  @ApiPropertyOptional({
    description: 'Inclure les métriques',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeMetrics?: boolean = true;

  @ApiPropertyOptional({
    description: 'Inclure l\'historique des événements',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeEvents?: boolean = true;

  @ApiPropertyOptional({
    description: 'Inclure les badges',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeBadges?: boolean = true;

  @ApiPropertyOptional({
    description: 'Période d\'historique en jours',
    minimum: 1,
    maximum: 1095,
    default: 365
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1095)
  @Transform(({ value }) => parseInt(value))
  historyPeriod?: number = 365;

  @ApiPropertyOptional({
    description: 'Anonymiser les données sensibles',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  anonymize?: boolean = false;
}

export class GDPRComplianceDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur',
    example: 'user_123456'
  })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'Inclure l\'analyse de rétention des données',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeRetentionAnalysis?: boolean = true;

  @ApiPropertyOptional({
    description: 'Vérifier les permissions de traitement',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  checkProcessingPermissions?: boolean = true;

  @ApiPropertyOptional({
    description: 'Générer le rapport détaillé',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  generateDetailedReport?: boolean = false;
}

// =====================================
// 🎯 DTOs PERFORMANCE ET MONITORING
// =====================================

export class PerformanceStatsDto {
  @ApiPropertyOptional({
    description: 'Période d\'analyse en heures',
    minimum: 1,
    maximum: 168,
    default: 24
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168)
  @Transform(({ value }) => parseInt(value))
  timeframe?: number = 24;

  @ApiPropertyOptional({
    description: 'Inclure les statistiques de cache',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeCacheStats?: boolean = true;

  @ApiPropertyOptional({
    description: 'Inclure les statistiques de base de données',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeDatabaseStats?: boolean = true;

  @ApiPropertyOptional({
    description: 'Inclure l\'analyse des erreurs',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeErrorAnalysis?: boolean = true;

  @ApiPropertyOptional({
    description: 'Granularité des données',
    enum: ['HOURLY', 'DAILY', 'SUMMARY'],
    default: 'HOURLY'
  })
  @IsOptional()
  @IsEnum(['HOURLY', 'DAILY', 'SUMMARY'])
  granularity?: 'HOURLY' | 'DAILY' | 'SUMMARY' = 'HOURLY';
}

export class HealthCheckDto {
  @ApiPropertyOptional({
    description: 'Niveau de détail du check',
    enum: ['BASIC', 'DETAILED', 'COMPREHENSIVE'],
    default: 'BASIC'
  })
  @IsOptional()
  @IsEnum(['BASIC', 'DETAILED', 'COMPREHENSIVE'])
  level?: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE' = 'BASIC';

  @ApiPropertyOptional({
    description: 'Inclure les tests de connectivité',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeConnectivityTests?: boolean = false;

  @ApiPropertyOptional({
    description: 'Inclure les métriques de performance',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includePerformanceMetrics?: boolean = false;

  @ApiPropertyOptional({
    description: 'Timeout en secondes pour les tests',
    minimum: 1,
    maximum: 30,
    default: 5
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  @Transform(({ value }) => parseInt(value))
  timeoutSeconds?: number = 5;
}

// =====================================
// 🔍 DTOs RECHERCHE AVANCÉE
// =====================================

export class AdvancedSearchDto {
  @ApiPropertyOptional({
    description: 'Terme de recherche général',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiPropertyOptional({
    description: 'Filtres de réputation utilisateur'
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserReputationQueryDto)
  userFilters?: UserReputationQueryDto;

  @ApiPropertyOptional({
    description: 'Filtres de réputation tontine'
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TontineReputationQueryDto)
  tontineFilters?: TontineReputationQueryDto;

  @ApiPropertyOptional({
    description: 'Filtres d\'événements'
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReputationEventQueryDto)
  eventFilters?: ReputationEventQueryDto;

  @ApiPropertyOptional({
    description: 'Pondération des résultats',
    type: 'object',
    properties: {
      score: { type: 'number', minimum: 0, maximum: 1 },
      activity: { type: 'number', minimum: 0, maximum: 1 },
      badges: { type: 'number', minimum: 0, maximum: 1 },
      social: { type: 'number', minimum: 0, maximum: 1 }
    }
  })
  @IsOptional()
  @IsObject()
  weights?: {
    score?: number;
    activity?: number;
    badges?: number;
    social?: number;
  };

  @ApiPropertyOptional({
    description: 'Algorithme de tri',
    enum: ['RELEVANCE', 'SCORE', 'ACTIVITY', 'RECENT'],
    default: 'RELEVANCE'
  })
  @IsOptional()
  @IsEnum(['RELEVANCE', 'SCORE', 'ACTIVITY', 'RECENT'])
  sortAlgorithm?: 'RELEVANCE' | 'SCORE' | 'ACTIVITY' | 'RECENT' = 'RELEVANCE';

  @ApiPropertyOptional({
    description: 'Nombre maximum de résultats',
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  maxResults?: number = 20;

  @ApiPropertyOptional({
    description: 'Inclure les suggestions',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeSuggestions?: boolean = true;
}

// =====================================
// 📊 DTOs STATISTIQUES GLOBALES
// =====================================

export class GlobalStatsDto {
  @ApiPropertyOptional({
    description: 'Période d\'analyse',
    enum: ['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR', 'ALL_TIME'],
    default: 'MONTH'
  })
  @IsOptional()
  @IsEnum(['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR', 'ALL_TIME'])
  period?: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'ALL_TIME' = 'MONTH';

  @ApiPropertyOptional({
    description: 'Segmentation géographique',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeGeographicBreakdown?: boolean = false;

  @ApiPropertyOptional({
    description: 'Analyse des tendances',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeTrendAnalysis?: boolean = true;

  @ApiPropertyOptional({
    description: 'Comparaison avec période précédente',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includePeriodComparison?: boolean = true;

  @ApiPropertyOptional({
    description: 'Prédictions pour la période suivante',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includePredictions?: boolean = false;
}

export class CorrelationAnalysisDto {
  @ApiPropertyOptional({
    description: 'Métriques à analyser',
    isArray: true,
    example: ['payment_punctuality', 'social_score', 'completion_rate']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];

  @ApiPropertyOptional({
    description: 'Seuil de corrélation minimum',
    minimum: 0,
    maximum: 1,
    default: 0.3
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Transform(({ value }) => parseFloat(value))
  minCorrelation?: number = 0.3;

  @ApiPropertyOptional({
    description: 'Période d\'analyse en jours',
    minimum: 30,
    maximum: 365,
    default: 90
  })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(365)
  @Transform(({ value }) => parseInt(value))
  analysisPeriod?: number = 90;

  @ApiPropertyOptional({
    description: 'Inclure l\'analyse causale',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeCausalAnalysis?: boolean = false;

  @ApiPropertyOptional({
    description: 'Segmenter par niveau de réputation',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  segmentByLevel?: boolean = false;
}

// =====================================
// 🎯 DTO DE BASE POUR PAGINATION
// =====================================

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Numéro de page (commence à 1)',
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page',
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Champ de tri'
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    enum: ['ASC', 'DESC'],
    default: 'DESC'
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// =====================================
// 🔧 DTO DE RÉPONSE PAGINÉE
// =====================================

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Données de la page actuelle' })
  data: T[];

  @ApiProperty({ description: 'Informations de pagination' })
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  @ApiProperty({ description: 'Métadonnées de la requête' })
  metadata: {
    executionTime: number;
    cacheUsed: boolean;
    dataFreshness: Date;
    apiVersion: string;
  };
}

// =====================================
// 📊 DTO DE RÉPONSE STATISTIQUES
// =====================================

export class StatsResponseDto {
  @ApiProperty({ description: 'Valeur principale de la statistique' })
  value: number;

  @ApiProperty({ description: 'Changement par rapport à la période précédente' })
  change: {
    absolute: number;
    percentage: number;
    trend: TrendDirection;
  };

  @ApiProperty({ description: 'Contexte et comparaisons' })
  context: {
    average: number;
    median: number;
    percentile: number;
    rank: number;
  };

  @ApiProperty({ description: 'Métadonnées du calcul' })
  metadata: {
    calculatedAt: Date;
    period: string;
    sampleSize: number;
    confidence: number;
  };
}
