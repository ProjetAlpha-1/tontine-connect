// backend/src/active/dto/notification.dto.ts

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
  IsObject,
  IsEmail,
  Matches
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  NotificationChannel, 
  NotificationPriority, 
  NotificationStatus 
} from '../types/active-types';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Type de notification',
    example: 'payment_reminder',
    enum: [
      'payment_reminder', 'payment_overdue', 'payment_confirmed',
      'cycle_started', 'cycle_ending', 'cycle_completed',
      'your_turn_next', 'penalty_applied', 'penalty_waived',
      'member_joined', 'member_left', 'tontine_completed',
      'system_maintenance', 'deadline_extension', 'dispute_filed',
      'admin_message', 'custom'
    ]
  })
  @IsEnum([
    'payment_reminder', 'payment_overdue', 'payment_confirmed',
    'cycle_started', 'cycle_ending', 'cycle_completed',
    'your_turn_next', 'penalty_applied', 'penalty_waived',
    'member_joined', 'member_left', 'tontine_completed',
    'system_maintenance', 'deadline_extension', 'dispute_filed',
    'admin_message', 'custom'
  ])
  type: string;

  @ApiProperty({
    description: 'Catégorie de notification',
    example: 'payment',
    enum: ['payment', 'cycle', 'penalty', 'system', 'social', 'admin', 'reminder']
  })
  @IsEnum(['payment', 'cycle', 'penalty', 'system', 'social', 'admin', 'reminder'])
  category: string;

  @ApiProperty({
    description: 'Priorité de la notification',
    example: 'medium',
    enum: ['low', 'medium', 'high', 'urgent', 'critical']
  })
  @IsEnum(['low', 'medium', 'high', 'urgent', 'critical'])
  priority: NotificationPriority;

  @ApiProperty({
    description: 'Titre de la notification',
    example: 'Rappel de paiement - Cycle 5',
    minLength: 5,
    maxLength: 100
  })
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Message principal',
    example: 'Votre paiement de 50,000 FCFA pour le cycle 5 est attendu avant le 15 décembre.',
    minLength: 10,
    maxLength: 1000
  })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  message: string;

  @ApiPropertyOptional({
    description: 'Message court pour SMS/Push',
    example: 'Paiement cycle 5: 50,000 FCFA avant 15/12',
    maxLength: 160
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  shortMessage?: string;

  @ApiPropertyOptional({
    description: 'Message complet pour email',
    example: 'Cher membre, nous vous rappelons que votre contribution...',
    maxLength: 5000
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  fullMessage?: string;

  @ApiProperty({
    description: 'IDs des destinataires',
    example: ['member_123', 'member_456'],
    isArray: true
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  recipientIds: string[];

  @ApiProperty({
    description: 'Canaux de diffusion',
    example: ['sms', 'email'],
    isArray: true,
    enum: ['sms', 'email', 'push', 'in_app', 'whatsapp']
  })
  @IsArray()
  @IsEnum(['sms', 'email', 'push', 'in_app', 'whatsapp'], { each: true })
  channels: NotificationChannel[];

  @ApiPropertyOptional({
    description: 'Canal préféré',
    example: 'sms',
    enum: ['sms', 'email', 'push', 'in_app']
  })
  @IsOptional()
  @IsEnum(['sms', 'email', 'push', 'in_app'])
  preferredChannel?: NotificationChannel;

  @ApiPropertyOptional({
    description: 'Envoyer immédiatement',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  sendImmediately?: boolean = true;

  @ApiPropertyOptional({
    description: 'Date d\'envoi programmé',
    example: '2024-12-10T10:00:00Z',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({
    description: 'Variables pour personnalisation',
    example: { memberName: 'John Doe', amount: 50000, dueDate: '15/12/2024' }
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'ID du template à utiliser',
    example: 'template_payment_reminder_001'
  })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({
    description: 'Action requise du destinataire',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  actionRequired?: boolean = false;

  @ApiPropertyOptional({
    description: 'Type d\'action',
    example: 'make_payment',
    enum: ['confirm_payment', 'make_payment', 'update_info', 'contact_admin', 'join_meeting']
  })
  @IsOptional()
  @IsEnum(['confirm_payment', 'make_payment', 'update_info', 'contact_admin', 'join_meeting'])
  actionType?: string;

  @ApiPropertyOptional({
    description: 'URL d\'action',
    example: 'https://app.tontineconnect.com/payments/make/cycle_5'
  })
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiPropertyOptional({
    description: 'Date limite pour l\'action',
    example: '2024-12-15T23:59:59Z',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  actionDeadline?: string;
}

export class SendNotificationDto {
  @ApiProperty({
    description: 'IDs des notifications à envoyer',
    example: ['notif_123', 'notif_456'],
    isArray: true
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  notificationIds: string[];

  @ApiPropertyOptional({
    description: 'Forcer l\'envoi même si déjà envoyé',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  forceResend?: boolean = false;

  @ApiPropertyOptional({
    description: 'Canaux spécifiques à utiliser (remplace config originale)',
    example: ['sms'],
    isArray: true,
    enum: ['sms', 'email', 'push', 'in_app', 'whatsapp']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['sms', 'email', 'push', 'in_app', 'whatsapp'], { each: true })
  overrideChannels?: NotificationChannel[];

  @ApiPropertyOptional({
    description: 'Test d\'envoi (ne comptabilise pas les coûts)',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  testMode?: boolean = false;
}

export class GetNotificationsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: ['draft', 'scheduled', 'sending', 'sent', 'delivered', 'failed', 'cancelled'],
    isArray: true,
    example: ['sent', 'delivered']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['draft', 'scheduled', 'sending', 'sent', 'delivered', 'failed', 'cancelled'], { each: true })
  status?: NotificationStatus[];

  @ApiPropertyOptional({
    description: 'Filtrer par types',
    isArray: true,
    example: ['payment_reminder', 'cycle_started']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: string[];

  @ApiPropertyOptional({
    description: 'Filtrer par priorités',
    enum: ['low', 'medium', 'high', 'urgent', 'critical'],
    isArray: true,
    example: ['high', 'urgent']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['low', 'medium', 'high', 'urgent', 'critical'], { each: true })
  priorities?: NotificationPriority[];

  @ApiPropertyOptional({
    description: 'Filtrer par canaux',
    enum: ['sms', 'email', 'push', 'in_app', 'whatsapp'],
    isArray: true,
    example: ['sms', 'email']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['sms', 'email', 'push', 'in_app', 'whatsapp'], { each: true })
  channels?: NotificationChannel[];

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
    description: 'Filtrer par IDs de destinataires',
    isArray: true,
    example: ['member_123', 'member_456']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipientIds?: string[];

  @ApiPropertyOptional({
    description: 'Seulement les notifications avec réponses',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasResponses?: boolean;

  @ApiPropertyOptional({
    description: 'Seulement les notifications non lues',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  unreadOnly?: boolean;

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
    example: 'createdAt',
    enum: ['createdAt', 'sentAt', 'priority', 'title', 'status']
  })
  @IsOptional()
  @IsEnum(['createdAt', 'sentAt', 'priority', 'title', 'status'])
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

export class MarkNotificationReadDto {
  @ApiProperty({
    description: 'IDs des notifications à marquer comme lues',
    example: ['notif_123', 'notif_456'],
    isArray: true
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  notificationIds: string[];

  @ApiPropertyOptional({
    description: 'ID du destinataire (si différent de l\'utilisateur connecté)',
    example: 'member_123'
  })
  @IsOptional()
  @IsString()
  recipientId?: string;
}

export class RespondToNotificationDto {
  @ApiProperty({
    description: 'Contenu de la réponse',
    example: 'Paiement effectué, merci pour le rappel',
    minLength: 1,
    maxLength: 1000
  })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;

  @ApiPropertyOptional({
    description: 'Type de réponse',
    example: 'text',
    enum: ['text', 'action', 'emoji', 'confirmation'],
    default: 'text'
  })
  @IsOptional()
  @IsEnum(['text', 'action', 'emoji', 'confirmation'])
  responseType?: string = 'text';

  @ApiPropertyOptional({
    description: 'Canal utilisé pour la réponse',
    example: 'sms',
    enum: ['sms', 'email', 'in_app']
  })
  @IsOptional()
  @IsEnum(['sms', 'email', 'in_app'])
  channel?: string;
}

export class UpdateNotificationDto {
  @ApiPropertyOptional({
    description: 'Nouveau titre',
    example: 'Rappel urgent - Paiement en retard',
    minLength: 5,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: 'Nouveau message',
    example: 'Message mis à jour avec nouvelles informations',
    minLength: 10,
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  message?: string;

  @ApiPropertyOptional({
    description: 'Nouvelle priorité',
    example: 'high',
    enum: ['low', 'medium', 'high', 'urgent', 'critical']
  })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent', 'critical'])
  priority?: NotificationPriority;

  @ApiPropertyOptional({
    description: 'Nouvelle date d\'envoi programmé',
    example: '2024-12-12T14:00:00Z',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({
    description: 'Nouveaux canaux',
    example: ['sms', 'push'],
    isArray: true,
    enum: ['sms', 'email', 'push', 'in_app', 'whatsapp']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['sms', 'email', 'push', 'in_app', 'whatsapp'], { each: true })
  channels?: NotificationChannel[];
}

export class NotificationStatsDto {
  @ApiPropertyOptional({
    description: 'Période d\'analyse',
    enum: ['today', 'week', 'month', 'quarter', 'year', 'all'],
    example: 'month',
    default: 'month'
  })
  @IsOptional()
  @IsEnum(['today', 'week', 'month', 'quarter', 'year', 'all'])
  period?: string = 'month';

  @ApiPropertyOptional({
    description: 'Grouper par canal',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  groupByChannel?: boolean = false;

  @ApiPropertyOptional({
    description: 'Grouper par type',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  groupByType?: boolean = false;

  @ApiPropertyOptional({
    description: 'Inclure les coûts',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeCosts?: boolean = false;

  @ApiPropertyOptional({
    description: 'Inclure les taux de réponse',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeResponseRates?: boolean = true;
}
