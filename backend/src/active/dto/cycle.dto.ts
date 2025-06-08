// backend/src/active/dto/cycle.dto.ts

import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsEnum, 
  IsBoolean, 
  IsDateString, 
  IsArray, 
  ValidateNested, 
  Min, 
  Max, 
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsPositive,
  IsInt
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CycleStatus } from '../types/active-types';

export class TriggerNextCycleDto {
  @ApiPropertyOptional({
    description: 'Forcer le déclenchement même si le cycle actuel n\'est pas complété',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  forceStart?: boolean = false;

  @ApiPropertyOptional({
    description: 'Date de début personnalisée pour le nouveau cycle',
    example: '2024-12-15',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  customStartDate?: string;

  @ApiPropertyOptional({
    description: 'Date d\'échéance personnalisée pour le nouveau cycle',
    example: '2024-12-30',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  customDueDate?: string;

  @ApiPropertyOptional({
    description: 'ID du bénéficiaire personnalisé (remplace l\'ordre automatique)',
    example: 'member_123456789'
  })
  @IsOptional()
  @IsString()
  customPayeeId?: string;

  @ApiPropertyOptional({
    description: 'Montant attendu personnalisé pour ce cycle',
    example: 50000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(0)
  customExpectedAmount?: number;

  @ApiPropertyOptional({
    description: 'Notes pour le nouveau cycle',
    example: 'Cycle de fin d\'année avec bonus',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Envoyer des notifications de début de cycle',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  sendNotifications?: boolean = true;

  @ApiPropertyOptional({
    description: 'Créer automatiquement les paiements attendus',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  createPayments?: boolean = true;
}

export class UpdateCycleDto {
  @ApiPropertyOptional({
    description: 'Nouveau statut du cycle',
    enum: ['pending', 'active', 'completed', 'overdue', 'cancelled'],
    example: 'completed'
  })
  @IsOptional()
  @IsEnum(['pending', 'active', 'completed', 'overdue', 'cancelled'])
  status?: CycleStatus;

  @ApiPropertyOptional({
    description: 'Nouvelle date de fin',
    example: '2024-12-30',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Nouvelle date d\'échéance',
    example: '2024-12-25',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Nouveau montant attendu',
    example: 55000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  expectedAmount?: number;

  @ApiPropertyOptional({
    description: 'Nouveau bénéficiaire',
    example: 'member_987654321'
  })
  @IsOptional()
  @IsString()
  payeeId?: string;

  @ApiPropertyOptional({
    description: 'Notes de mise à jour',
    example: 'Extension accordée suite à force majeure',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Commentaires administrateur',
    example: 'Décision prise en conseil d\'administration',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminComments?: string;

  @ApiPropertyOptional({
    description: 'Raison de la modification',
    example: 'Extension de délai pour circonstances exceptionnelles',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  updateReason?: string;
}

export class ExtendCycleDeadlineDto {
  @ApiProperty({
    description: 'Nouvelle date d\'échéance',
    example: '2024-12-30',
    format: 'date'
  })
  @IsDateString()
  newDueDate: string;

  @ApiProperty({
    description: 'Nombre de jours d\'extension',
    example: 7,
    minimum: 1,
    maximum: 30
  })
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(30)
  additionalDays: number;

  @ApiProperty({
    description: 'Raison de l\'extension',
    example: 'Difficultés financières temporaires de plusieurs membres',
    minLength: 10,
    maxLength: 500
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  reason: string;

  @ApiPropertyOptional({
    description: 'IDs des membres concernés par l\'extension',
    example: ['member_123', 'member_456'],
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  affectedMembers?: string[];

  @ApiPropertyOptional({
    description: 'Extension automatique pour les cycles futurs',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  applyToFutureCycles?: boolean = false;

  @ApiPropertyOptional({
    description: 'Envoyer des notifications d\'extension',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  sendNotifications?: boolean = true;
}

export class GetCyclesQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: ['pending', 'active', 'completed', 'overdue', 'cancelled'],
    isArray: true,
    example: ['active', 'pending']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['pending', 'active', 'completed', 'overdue', 'cancelled'], { each: true })
  status?: CycleStatus[];

  @ApiPropertyOptional({
    description: 'Filtrer par IDs des bénéficiaires',
    isArray: true,
    example: ['member_123', 'member_456']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  payeeIds?: string[];

  @ApiPropertyOptional({
    description: 'Date de début de la période',
    example: '2024-01-01',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Date de fin de la période',
    example: '2024-12-31',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Montant minimum attendu',
    example: 10000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Montant maximum attendu',
    example: 100000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({
    description: 'Seulement les cycles avec paiements en retard',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasOverduePayments?: boolean;

  @ApiPropertyOptional({
    description: 'Pourcentage minimum de completion',
    example: 80,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minCompletionPercentage?: number;

  @ApiPropertyOptional({
    description: 'Pourcentage maximum de completion',
    example: 100,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maxCompletionPercentage?: number;

  @ApiPropertyOptional({
    description: 'Inclure l\'historique des paiements',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includePayments?: boolean = false;

  @ApiPropertyOptional({
    description: 'Inclure les pénalités',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includePenalties?: boolean = false;

  @ApiPropertyOptional({
    description: 'Numéro de page',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page',
    example: 10,
    minimum: 1,
    maximum: 50,
    default: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    example: 'startDate',
    enum: ['number', 'startDate', 'dueDate', 'expectedAmount', 'completionPercentage']
  })
  @IsOptional()
  @IsEnum(['number', 'startDate', 'dueDate', 'expectedAmount', 'completionPercentage'])
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class CycleStatsDto {
  @ApiPropertyOptional({
    description: 'Période d\'analyse',
    enum: ['current', 'last_3_cycles', 'last_6_cycles', 'all'],
    example: 'last_3_cycles',
    default: 'current'
  })
  @IsOptional()
  @IsEnum(['current', 'last_3_cycles', 'last_6_cycles', 'all'])
  period?: string = 'current';

  @ApiPropertyOptional({
    description: 'Inclure les comparaisons avec cycles précédents',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeComparison?: boolean = false;

  @ApiPropertyOptional({
    description: 'Inclure les tendances et projections',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeTrends?: boolean = false;

  @ApiPropertyOptional({
    description: 'Métriques spécifiques à inclure',
    example: ['completion_rate', 'payment_delay', 'participation'],
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];
}

export class CompleteCycleDto {
  @ApiPropertyOptional({
    description: 'Forcer la completion même si tous les paiements ne sont pas reçus',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  forceComplete?: boolean = false;

  @ApiPropertyOptional({
    description: 'Date de completion personnalisée',
    example: '2024-12-31',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @ApiPropertyOptional({
    description: 'Traitement des paiements manquants',
    enum: ['ignore', 'mark_as_penalty', 'create_debt'],
    example: 'mark_as_penalty',
    default: 'mark_as_penalty'
  })
  @IsOptional()
  @IsEnum(['ignore', 'mark_as_penalty', 'create_debt'])
  handleMissingPayments?: string = 'mark_as_penalty';

  @ApiPropertyOptional({
    description: 'Notes de completion',
    example: 'Cycle complété avec 90% de participation',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  completionNotes?: string;

  @ApiPropertyOptional({
    description: 'Envoyer notifications de fin de cycle',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  sendNotifications?: boolean = true;

  @ApiPropertyOptional({
    description: 'Générer automatiquement le rapport de cycle',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  generateReport?: boolean = true;
}
