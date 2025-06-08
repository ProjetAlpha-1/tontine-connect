// backend/src/active/dto/penalty.dto.ts

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
import { 
  PenaltyType, 
  PenaltyCategory, 
  PenaltyCalculationMethod, 
  PenaltyStatus 
} from '../types/active-types';

export class ApplyPenaltyDto {
  @ApiProperty({
    description: 'ID du membre concerné',
    example: 'member_123456789'
  })
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @ApiPropertyOptional({
    description: 'ID du cycle concerné (optionnel pour pénalités générales)',
    example: 'cycle_123456789'
  })
  @IsOptional()
  @IsString()
  cycleId?: string;

  @ApiPropertyOptional({
    description: 'ID du paiement concerné (optionnel)',
    example: 'payment_123456789'
  })
  @IsOptional()
  @IsString()
  paymentId?: string;

  @ApiProperty({
    description: 'Type de pénalité',
    enum: ['late_payment', 'missed_payment', 'partial_payment', 'behavior', 'manual', 'automatic'],
    example: 'late_payment'
  })
  @IsEnum(['late_payment', 'missed_payment', 'partial_payment', 'behavior', 'manual', 'automatic'])
  type: PenaltyType;

  @ApiProperty({
    description: 'Catégorie de pénalité',
    enum: ['financial', 'behavioral', 'administrative'],
    example: 'financial'
  })
  @IsEnum(['financial', 'behavioral', 'administrative'])
  category: PenaltyCategory;

  @ApiProperty({
    description: 'Raison de la pénalité',
    example: 'Paiement en retard de 5 jours après la date limite',
    minLength: 10,
    maxLength: 500
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  reason: string;

  @ApiProperty({
    description: 'Montant de la pénalité',
    example: 5000,
    minimum: 0
  })
  @IsNumber()
  @IsPositive()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    description: 'Méthode de calcul utilisée',
    enum: ['fixed', 'percentage', 'daily', 'escalating', 'custom'],
    example: 'percentage',
    default: 'fixed'
  })
  @IsOptional()
  @IsEnum(['fixed', 'percentage', 'daily', 'escalating', 'custom'])
  calculationMethod?: PenaltyCalculationMethod = 'fixed';

  @ApiPropertyOptional({
    description: 'Base de calcul (montant du paiement, contribution, etc.)',
    example: 50000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  calculationBase?: number;

  @ApiPropertyOptional({
    description: 'Taux ou pourcentage de calcul',
    example: 10,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  calculationRate?: number;

  @ApiPropertyOptional({
    description: 'Date de la violation',
    example: '2024-12-07',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  violationDate?: string;

  @ApiPropertyOptional({
    description: 'Nombre de jours de retard',
    example: 5,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(0)
  daysLate?: number;

  @ApiPropertyOptional({
    description: 'Appliquer immédiatement la pénalité',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  applyImmediately?: boolean = true;

  @ApiPropertyOptional({
    description: 'Envoyer une notification au membre',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  sendNotification?: boolean = true;

  @ApiPropertyOptional({
    description: 'Notes administrateur',
    example: 'Pénalité automatique selon règlement article 5.2',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNotes?: string;
}

export class WaivePenaltyDto {
  @ApiProperty({
    description: 'Raison de la dispense',
    example: 'Circonstances exceptionnelles validées par le comité',
    minLength: 10,
    maxLength: 500
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  reason: string;

  @ApiPropertyOptional({
    description: 'Montant dispensé (partiel ou total)',
    example: 3000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  waivedAmount?: number;

  @ApiPropertyOptional({
    description: 'Dispense totale de la pénalité',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  fullWaiver?: boolean = true;

  @ApiPropertyOptional({
    description: 'Envoyer notification de dispense',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  sendNotification?: boolean = true;
}

export class DisputePenaltyDto {
  @ApiProperty({
    description: 'Raison de la contestation',
    example: 'Le paiement a été effectué dans les délais mais non comptabilisé',
    minLength: 20,
    maxLength: 1000
  })
  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  disputeReason: string;

  @ApiPropertyOptional({
    description: 'Preuves supportant la contestation',
    example: ['receipt_123.pdf', 'bank_statement.jpg'],
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportingEvidence?: string[];

  @ApiPropertyOptional({
    description: 'Montant contesté (peut être partiel)',
    example: 5000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  disputedAmount?: number;

  @ApiPropertyOptional({
    description: 'Contact préféré pour résolution',
    example: '+24107123456',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  preferredContact?: string;
}

export class ResolvePenaltyDisputeDto {
  @ApiProperty({
    description: 'Décision de résolution',
    enum: ['approved', 'rejected', 'partial'],
    example: 'approved'
  })
  @IsEnum(['approved', 'rejected', 'partial'])
  resolution: 'approved' | 'rejected' | 'partial';

  @ApiProperty({
    description: 'Justification de la décision',
    example: 'Après vérification, le paiement était bien effectué dans les délais',
    minLength: 20,
    maxLength: 1000
  })
  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  resolutionReason: string;

  @ApiPropertyOptional({
    description: 'Nouveau montant de pénalité (pour résolution partielle)',
    example: 2000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  newPenaltyAmount?: number;

  @ApiPropertyOptional({
    description: 'Compensation à accorder au membre',
    example: 1000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compensationAmount?: number;

  @ApiPropertyOptional({
    description: 'Actions correctives à prendre',
    example: ['update_payment_system', 'review_penalty_rules'],
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  correctiveActions?: string[];
}

export class GetPenaltiesQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: ['pending', 'applied', 'paid', 'waived', 'disputed', 'cancelled'],
    isArray: true,
    example: ['applied', 'pending']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['pending', 'applied', 'paid', 'waived', 'disputed', 'cancelled'], { each: true })
  status?: PenaltyStatus[];

  @ApiPropertyOptional({
    description: 'Filtrer par types',
    enum: ['late_payment', 'missed_payment', 'partial_payment', 'behavior', 'manual', 'automatic'],
    isArray: true,
    example: ['late_payment', 'missed_payment']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['late_payment', 'missed_payment', 'partial_payment', 'behavior', 'manual', 'automatic'], { each: true })
  types?: PenaltyType[];

  @ApiPropertyOptional({
    description: 'Filtrer par catégories',
    enum: ['financial', 'behavioral', 'administrative'],
    isArray: true,
    example: ['financial']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['financial', 'behavioral', 'administrative'], { each: true })
  categories?: PenaltyCategory[];

  @ApiPropertyOptional({
    description: 'Filtrer par IDs de membres',
    isArray: true,
    example: ['member_123', 'member_456']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  memberIds?: string[];

  @ApiPropertyOptional({
    description: 'Date de début',
    example: '2024-01-01',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Date de fin',
    example: '2024-12-31',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Montant minimum',
    example: 1000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Montant maximum',
    example: 20000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({
    description: 'Seulement les pénalités contestées',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  disputedOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Seulement les pénalités dispensées',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  waivedOnly?: boolean;

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
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    example: 'violationDate',
    enum: ['violationDate', 'amount', 'createdAt', 'appliedDate', 'memberName']
  })
  @IsOptional()
  @IsEnum(['violationDate', 'amount', 'createdAt', 'appliedDate', 'memberName'])
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

export class BulkPenaltyActionDto {
  @ApiProperty({
    description: 'IDs des pénalités concernées',
    example: ['penalty_123', 'penalty_456', 'penalty_789'],
    isArray: true
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  penaltyIds: string[];

  @ApiProperty({
    description: 'Action à effectuer',
    enum: ['apply', 'waive', 'cancel', 'send_reminder', 'mark_paid'],
    example: 'apply'
  })
  @IsEnum(['apply', 'waive', 'cancel', 'send_reminder', 'mark_paid'])
  action: string;

  @ApiPropertyOptional({
    description: 'Paramètres spécifiques à l\'action',
    example: { sendNotification: true, reason: 'Décision collective du comité' }
  })
  @IsOptional()
  actionParams?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Raison de l\'action groupée',
    example: 'Application en lot des pénalités de retard du cycle 5',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}

export class PenaltyStatsDto {
  @ApiPropertyOptional({
    description: 'Période d\'analyse',
    enum: ['current_cycle', 'last_3_cycles', 'month', 'quarter', 'year', 'all'],
    example: 'current_cycle',
    default: 'current_cycle'
  })
  @IsOptional()
  @IsEnum(['current_cycle', 'last_3_cycles', 'month', 'quarter', 'year', 'all'])
  period?: string = 'current_cycle';

  @ApiPropertyOptional({
    description: 'Grouper par type de pénalité',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  groupByType?: boolean = false;

  @ApiPropertyOptional({
    description: 'Grouper par membre',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  groupByMember?: boolean = false;

  @ApiPropertyOptional({
    description: 'Inclure les tendances',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeTrends?: boolean = false;
}
