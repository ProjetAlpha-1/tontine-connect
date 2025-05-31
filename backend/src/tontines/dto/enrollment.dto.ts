// backend/src/tontines/dto/enrollment.dto.ts

import { IsString, IsEmail, IsOptional, IsEnum, IsPhoneNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum InvitationMethod {
  SMS = 'sms',
  LINK = 'link',
  QR_CODE = 'qr_code',
  MANUAL = 'manual'
}

export enum MemberStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  JOINED = 'joined'
}

export class CreateInvitationDto {
  @ApiProperty({ example: '+241066123456' })
  @IsPhoneNumber('GA') // Code pays Gabon
  phoneNumber: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'jean.dupont@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ enum: InvitationMethod })
  @IsEnum(InvitationMethod)
  method: InvitationMethod;
}

export class RespondToInvitationDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  invitationToken: string;

  @ApiProperty({ enum: ['accept', 'decline'] })
  @IsEnum(['accept', 'decline'])
  response: 'accept' | 'decline';

  @ApiProperty({
    type: 'object',
    properties: {
      firstName: { type: 'string', example: 'Jean' },
      lastName: { type: 'string', example: 'Dupont' },
      phoneNumber: { type: 'string', example: '+241066123456' },
      email: { type: 'string', example: 'jean.dupont@example.com' }
    }
  })
  userInfo: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
  };
}

export class ProcessMemberRequestDto {
  @ApiProperty({ example: 'uuid-of-member' })
  @IsUUID()
  memberId: string;

  @ApiProperty({ enum: ['approve', 'reject'] })
  @IsEnum(['approve', 'reject'])
  action: 'approve' | 'reject';

  @ApiProperty({ example: 'Profil incomplet', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}

// Réponses API adaptées au frontend existant
export interface EnrollmentStatsResponse {
  totalInvited: number;
  totalPending: number;
  totalApproved: number;
  totalJoined: number;
  totalRejected: number;
  remainingSpots: number;
  canStartConfiguration: boolean;
}

// Compatible avec TontineParticipation du frontend
export interface MemberResponse {
  id: string;
  userId?: string;
  userName?: string;
  userPhone: string;
  status: 'pending' | 'approved' | 'rejected' | 'joined';
  joinedAt: Date;
  position?: number;
  // Champs additionnels pour la gestion
  tontineId: string;
  firstName: string;
  lastName: string;
  email?: string;
  invitationMethod: InvitationMethod;
  invitedAt: Date;
  respondedAt?: Date;
  approvedAt?: Date;
}

export interface InvitationResponse {
  id: string;
  invitationLink: string;
  qrCodeData?: string;
  expiresAt: Date;
  method: InvitationMethod;
}

// Réponse pour la page d'enrollment complète
export interface TontineEnrollmentResponse {
  id: string;
  name: string;
  description: string;
  objective: string;
  contributionAmount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  maxParticipants: number;
  minParticipants: number;
  enrollmentDeadline: Date;
  plannedStartDate: Date;
  status: string;
  currentParticipants: number;
  participations: MemberResponse[];
  invitationLink: string;
} 
