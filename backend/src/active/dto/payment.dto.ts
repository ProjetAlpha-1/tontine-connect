// backend/src/active/dto/payment.dto.ts

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
  IsUUID
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus, MobileMoneyProvider } from '../types/active-types';

// ✅ PaymentMethodDetailsDto DÉCLARÉE EN PREMIER
export class PaymentMethodDetailsDto {
  @ApiPropertyOptional({
    description: 'Fournisseur Mobile Money',
    enum: ['moov', 'airtel', 'other'],
    example: 'moov'
  })
  @IsOptional()
  @IsEnum(['moov', 'airtel', 'other'])
  mobileMoneyProvider?: string;

  @ApiPropertyOptional({
    description: 'Numéro Mobile Money',
    example: '+24107123456',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobileMoneyNumber?: string;

  @ApiPropertyOptional({
    description: 'Nom de la banque',
    example: 'BGFI Bank',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiPropertyOptional({
    description: 'Numéro de compte bancaire',
    example: '12345678901',
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  accountNumber?: string;

  @ApiPropertyOptional({
    description: 'Numéro de chèque',
    example: '0012345',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  checkNumber?: string;

  @ApiPropertyOptional({
    description: 'Banque émettrice du chèque',
    example: 'UGB',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  checkBank?: string;

  @ApiPropertyOptional({
    description: 'Informations supplémentaires',
    example: 'Paiement effectué au bureau principal',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  additionalInfo?: string;
}

// ✅ ConfirmPaymentDto UTILISE PaymentMethodDetailsDto (maintenant définie)
export class ConfirmPaymentDto {
  @ApiProperty({
    description: 'ID du paiement à confirmer',
    example: 'payment_123456789'
  })
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty({
    description: 'Montant réellement reçu',
    example: 50000,
    minimum: 0
  })
  @IsNumber()
  @IsPositive()
  @Min(0)
  receivedAmount: number;

  @ApiProperty({
    description: 'Méthode de paiement utilisée',
    enum: ['cash', 'bank_transfer', 'mobile_money', 'check', 'other'],
    example: 'mobile_money'
  })
  @IsEnum(['cash', 'bank_transfer', 'mobile_money', 'check', 'other'])
  method: string;

  @ApiPropertyOptional({
    description: 'Référence de transaction',
    example: 'TXN_MM_20241207_001',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @ApiPropertyOptional({
    description: 'Date de paiement effective',
    example: '2024-12-07T10:30:00Z',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  paidDate?: string;

  @ApiPropertyOptional({
    description: 'Notes sur le paiement',
    example: 'Paiement reçu en espèces, reçu émis',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    description: 'ID de transaction externe (banque, mobile money)',
    example: 'EXT_TXN_789456123',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  externalTransactionId?: string;

  @ApiPropertyOptional({
    description: 'Détails de la méthode de paiement'
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentMethodDetailsDto)
  methodDetails?: PaymentMethodDetailsDto;

  @ApiPropertyOptional({
    description: 'Notes de l\'administrateur',
    example: 'Paiement validé par l\'équipe',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNotes?: string;

  @ApiPropertyOptional({
    description: 'Confirmer automatiquement le paiement',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  autoConfirm?: boolean = false;

  @ApiPropertyOptional({
    description: 'Générer un reçu automatiquement',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  generateReceipt?: boolean = true;
}

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID du cycle concerné',
    example: 'cycle_123456789'
  })
  @IsString()
  @IsNotEmpty()
  cycleId: string;

  @ApiProperty({
    description: 'ID du membre qui doit payer',
    example: 'member_123456789'
  })
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @ApiProperty({
    description: 'Montant attendu',
    example: 50000,
    minimum: 0
  })
  @IsNumber()
  @IsPositive()
  @Min(0)
  expectedAmount: number;

  @ApiProperty({
    description: 'Date d\'échéance',
    example: '2024-12-15',
    format: 'date'
  })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({
    description: 'Montant déjà payé (pour paiements partiels)',
    example: 25000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Notes initiales',
    example: 'Paiement prévu par virement',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Paiement partiel autorisé',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  allowPartialPayment?: boolean = true;
}

export class UpdatePaymentDto {
  @ApiPropertyOptional({
    description: 'Nouveau montant',
    example: 50000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Nouvelle date d\'échéance',
    example: '2024-12-20',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Nouveau statut',
    enum: ['pending', 'paid', 'confirmed', 'late', 'penalty_applied', 'partial', 'cancelled'],
    example: 'confirmed'
  })
  @IsOptional()
  @IsEnum(['pending', 'paid', 'confirmed', 'late', 'penalty_applied', 'partial', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Notes de mise à jour',
    example: 'Délai accordé suite à demande motivée',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Raison de la modification',
    example: 'Extension de délai accordée',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  updateReason?: string;
}

export class GetPaymentsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: ['pending', 'paid', 'confirmed', 'late', 'penalty_applied', 'partial', 'cancelled'],
    isArray: true,
    example: ['pending', 'late']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['pending', 'paid', 'confirmed', 'late', 'penalty_applied', 'partial', 'cancelled'], { each: true })
  status?: string[];

  @ApiPropertyOptional({
    description: 'Filtrer par ID de membre',
    isArray: true,
    example: ['member_123', 'member_456']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  memberIds?: string[];

  @ApiPropertyOptional({
    description: 'Filtrer par méthode de paiement',
    enum: ['cash', 'bank_transfer', 'mobile_money', 'check', 'other'],
    isArray: true,
    example: ['mobile_money', 'cash']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['cash', 'bank_transfer', 'mobile_money', 'check', 'other'], { each: true })
  methods?: string[];

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
    example: 10000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Montant maximum',
    example: 100000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({
    description: 'Seulement les paiements nécessitant confirmation',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  requiresConfirmation?: boolean;

  @ApiPropertyOptional({
    description: 'Seulement les paiements avec pièces jointes',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasAttachments?: boolean;

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
    example: 'dueDate',
    enum: ['dueDate', 'amount', 'createdAt', 'paidDate', 'memberName']
  })
  @IsOptional()
  @IsEnum(['dueDate', 'amount', 'createdAt', 'paidDate', 'memberName'])
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

export class BulkPaymentActionDto {
  @ApiProperty({
    description: 'IDs des paiements concernés',
    example: ['payment_123', 'payment_456', 'payment_789'],
    isArray: true
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  paymentIds: string[];

  @ApiProperty({
    description: 'Action à effectuer',
    enum: ['confirm', 'cancel', 'mark_late', 'send_reminder', 'apply_penalty'],
    example: 'confirm'
  })
  @IsEnum(['confirm', 'cancel', 'mark_late', 'send_reminder', 'apply_penalty'])
  action: string;

  @ApiPropertyOptional({
    description: 'Paramètres spécifiques à l\'action',
    example: { generateReceipt: true, sendNotification: true }
  })
  @IsOptional()
  actionParams?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Raison de l\'action groupée',
    example: 'Confirmation en lot des paiements du cycle 5',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}