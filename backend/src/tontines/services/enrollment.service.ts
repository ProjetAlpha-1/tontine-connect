// backend/src/tontines/services/enrollment.service.ts

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { sign, verify } from 'jsonwebtoken';
import * as QRCode from 'qrcode';
import {
  CreateInvitationDto,
  RespondToInvitationDto,
  ProcessMemberRequestDto,
  InvitationMethod,
  MemberStatus,
  EnrollmentStatsResponse,
  MemberResponse,
  InvitationResponse,
  TontineEnrollmentResponse,
} from '../dto/enrollment.dto';

// Interfaces pour le stockage en mémoire
interface TontineMember {
  id: string;
  tontineId: string;
  userId?: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  status: MemberStatus;
  invitationMethod: InvitationMethod;
  invitedAt: Date;
  invitedBy: string;
  respondedAt?: Date;
  approvedAt?: Date;
  joinedAt?: Date;
  rejectionReason?: string;
}

interface TontineInvitation {
  id: string;
  tontineId: string;
  inviterUserId: string;
  inviteePhoneNumber: string;
  inviteeName?: string;
  method: InvitationMethod;
  invitationToken: string;
  expiresAt: Date;
  sentAt: Date;
  usedAt?: Date;
  isUsed: boolean;
}

@Injectable()
export class EnrollmentService {
  // Stockage en mémoire temporaire (remplacer par DB plus tard)
  private readonly members: Map<string, TontineMember> = new Map();
  private readonly invitations: Map<string, TontineInvitation> = new Map();
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'tontine-secret-key';

  /**
   * Créer une invitation pour rejoindre une tontine
   */
  async createInvitation(
    tontineId: string,
    inviterUserId: string,
    invitationData: CreateInvitationDto
  ): Promise<InvitationResponse> {
    // Vérifier que la tontine existe et est en phase d'enrollment
    // TODO: Intégrer avec TontineService existant
    
    // Vérifier que le numéro n'est pas déjà invité ou membre
    const existingMember = Array.from(this.members.values())
      .find(m => m.tontineId === tontineId && m.phoneNumber === invitationData.phoneNumber);
    
    if (existingMember) {
      throw new BadRequestException('Cette personne a déjà été invitée ou est déjà membre');
    }

    // Créer le token d'invitation sécurisé
    const invitationId = uuidv4();
    const invitationToken = sign(
      {
        invitationId,
        tontineId,
        phoneNumber: invitationData.phoneNumber,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 jours
      },
      this.JWT_SECRET
    );

    // Stocker l'invitation
    const invitation: TontineInvitation = {
      id: invitationId,
      tontineId,
      inviterUserId,
      inviteePhoneNumber: invitationData.phoneNumber,
      inviteeName: `${invitationData.firstName} ${invitationData.lastName}`,
      method: invitationData.method,
      invitationToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      sentAt: new Date(),
      isUsed: false
    };

    this.invitations.set(invitationId, invitation);

    // Créer le membre en statut PENDING
    const member: TontineMember = {
      id: uuidv4(),
      tontineId,
      phoneNumber: invitationData.phoneNumber,
      firstName: invitationData.firstName,
      lastName: invitationData.lastName,
      email: invitationData.email,
      status: MemberStatus.PENDING,
      invitationMethod: invitationData.method,
      invitedAt: new Date(),
      invitedBy: inviterUserId
    };

    this.members.set(member.id, member);

    // Générer le lien d'invitation
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const invitationLink = `${baseUrl}/tontines/${tontineId}/join?token=${invitationToken}`;

    // Générer le QR code si nécessaire
    let qrCodeData: string | undefined;
    if (invitationData.method === InvitationMethod.QR_CODE) {
      qrCodeData = await QRCode.toDataURL(invitationLink);
    }

    // TODO: Envoyer SMS si method === SMS
    if (invitationData.method === InvitationMethod.SMS) {
      await this.sendSmsInvitation(invitationData.phoneNumber, invitationLink, invitationData.firstName);
    }

    return {
      id: invitationId,
      invitationLink,
      qrCodeData,
      expiresAt: invitation.expiresAt,
      method: invitationData.method
    };
  }

  /**
   * Répondre à une invitation (accepter/décliner)
   */
  async respondToInvitation(responseData: RespondToInvitationDto): Promise<{ success: boolean; message: string }> {
    try {
      // Vérifier et décoder le token
      const decoded = verify(responseData.invitationToken, this.JWT_SECRET) as any;
      const invitation = this.invitations.get(decoded.invitationId);

      if (!invitation || invitation.isUsed) {
        throw new BadRequestException('Invitation invalide ou déjà utilisée');
      }

      if (new Date() > invitation.expiresAt) {
        throw new BadRequestException('Invitation expirée');
      }

      // Marquer l'invitation comme utilisée
      invitation.isUsed = true;
      invitation.usedAt = new Date();
      this.invitations.set(invitation.id, invitation);

      // Trouver le membre correspondant
      const member = Array.from(this.members.values())
        .find(m => m.tontineId === decoded.tontineId && m.phoneNumber === decoded.phoneNumber);

      if (!member) {
        throw new NotFoundException('Membre non trouvé');
      }

      // Mettre à jour le statut selon la réponse
      if (responseData.response === 'accept') {
        member.status = MemberStatus.APPROVED; // En attente d'approbation du créateur
        member.respondedAt = new Date();
        
        // Mettre à jour les informations utilisateur si fournies
        if (responseData.userInfo.firstName) member.firstName = responseData.userInfo.firstName;
        if (responseData.userInfo.lastName) member.lastName = responseData.userInfo.lastName;
        if (responseData.userInfo.email) member.email = responseData.userInfo.email;
      } else {
        member.status = MemberStatus.REJECTED;
        member.respondedAt = new Date();
        member.rejectionReason = 'Décliné par l\'invité';
      }

      this.members.set(member.id, member);

      return {
        success: true,
        message: responseData.response === 'accept' 
          ? 'Demande d\'adhésion soumise avec succès' 
          : 'Invitation déclinée'
      };

    } catch (error) {
      throw new BadRequestException('Token d\'invitation invalide');
    }
  }

  /**
   * Approuver ou rejeter une demande de membre
   */
  async processMemberRequest(
    tontineId: string,
    requestData: ProcessMemberRequestDto
  ): Promise<{ success: boolean; message: string }> {
    const member = this.members.get(requestData.memberId);

    if (!member || member.tontineId !== tontineId) {
      throw new NotFoundException('Membre non trouvé');
    }

    if (member.status !== MemberStatus.APPROVED) {
      throw new BadRequestException('Ce membre n\'est pas en attente d\'approbation');
    }

    if (requestData.action === 'approve') {
      member.status = MemberStatus.JOINED;
      member.approvedAt = new Date();
      member.joinedAt = new Date();
    } else {
      member.status = MemberStatus.REJECTED;
      member.rejectionReason = requestData.reason || 'Rejeté par le créateur';
    }

    this.members.set(member.id, member);

    return {
      success: true,
      message: requestData.action === 'approve' 
        ? 'Membre approuvé avec succès' 
        : 'Demande rejetée'
    };
  }

  /**
   * Obtenir tous les membres d'une tontine (format compatible frontend)
   */
  getTontineMembers(tontineId: string): MemberResponse[] {
    return Array.from(this.members.values())
      .filter(member => member.tontineId === tontineId)
      .map((member, index) => ({
        id: member.id,
        userId: member.userId,
        userName: member.userId === 'temp-user-id' ? 'Vous (Créateur)' : `${member.firstName} ${member.lastName}`,
        userPhone: member.phoneNumber,
        status: member.status as 'pending' | 'approved' | 'rejected' | 'joined',
        joinedAt: member.joinedAt || member.invitedAt,
        position: member.status === 'joined' ? index + 1 : undefined,
        // Champs additionnels pour la gestion
        tontineId: member.tontineId,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        invitationMethod: member.invitationMethod,
        invitedAt: member.invitedAt,
        respondedAt: member.respondedAt,
        approvedAt: member.approvedAt
      }));
  }

  /**
   * Obtenir les détails complets de la tontine pour la page d'enrollment
   */
  getTontineEnrollmentData(tontineId: string): TontineEnrollmentResponse {
    // TODO: Intégrer avec votre TontineService existant
    // Pour l'instant, données mockées compatibles avec votre frontend
    
    const members = this.getTontineMembers(tontineId);
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    return {
      id: tontineId,
      name: 'Tontine Projet ALPHA',
      description: 'Tontine des membres du cabinet',
      objective: 'Financement de projets personnels',
      contributionAmount: 25000,
      frequency: 'monthly',
      maxParticipants: 8,
      minParticipants: 3,
      enrollmentDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      plannedStartDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'enrollment',
      currentParticipants: members.filter(m => m.status === 'joined').length || 1,
      participations: members.length > 0 ? members : [
        {
          id: 'creator-1',
          userId: 'temp-user-id',
          userName: 'Vous (Créateur)',
          userPhone: '+241 XX XX XX XX',
          status: 'joined',
          joinedAt: new Date(),
          position: 1,
          tontineId,
          firstName: 'Créateur',
          lastName: 'Tontine',
          invitationMethod: InvitationMethod.MANUAL,
          invitedAt: new Date()
        }
      ],
      invitationLink: `${baseUrl}/join/${tontineId}`
    };
  }

  /**
   * Obtenir les statistiques d'enrollment d'une tontine
   */
  getEnrollmentStats(tontineId: string, maxParticipants: number, minParticipants: number): EnrollmentStatsResponse {
    const members = this.getTontineMembers(tontineId);
    
    const totalInvited = members.length;
    const totalPending = members.filter(m => m.status === MemberStatus.PENDING).length;
    const totalApproved = members.filter(m => m.status === MemberStatus.APPROVED).length;
    const totalJoined = members.filter(m => m.status === MemberStatus.JOINED).length;
    const totalRejected = members.filter(m => m.status === MemberStatus.REJECTED).length;
    
    const remainingSpots = maxParticipants - totalJoined;
    const canStartConfiguration = totalJoined >= minParticipants;

    return {
      totalInvited,
      totalPending,
      totalApproved,
      totalJoined,
      totalRejected,
      remainingSpots,
      canStartConfiguration
    };
  }

  /**
   * Envoyer une invitation par SMS (simulation pour l'instant)
   */
  private async sendSmsInvitation(phoneNumber: string, invitationLink: string, firstName: string): Promise<void> {
    // TODO: Intégrer avec un service SMS réel (Twilio, etc.)
    console.log(`SMS envoyé à ${phoneNumber}:`);
    console.log(`Salut ${firstName}! Tu es invité(e) à rejoindre une tontine. Clique ici: ${invitationLink}`);
    
    // Simulation d'envoi réussi
    return Promise.resolve();
  }
}
