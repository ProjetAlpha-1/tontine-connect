// backend/src/tontines/services/enrollment.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { sign, verify } from 'jsonwebtoken';
import * as QRCode from 'qrcode';
import { EnrollmentRequest, EnrollmentStatus, PaymentMethod } from '../entities/enrollment-request.entity';
import { ActiveTontine } from '../../active/entities/active-tontine.entity';
import { User } from '../../users/entities/user.entity';
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

@Injectable()
export class EnrollmentService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'tontine-secret-key';

  constructor(
    @InjectRepository(EnrollmentRequest)
    private readonly enrollmentRepository: Repository<EnrollmentRequest>,
    @InjectRepository(ActiveTontine)
    private readonly activeTontineRepository: Repository<ActiveTontine>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Méthode requise par ActiveService - Obtenir les IDs des membres actifs
   */
  async getActiveMemberIds(tontineId: string): Promise<string[]> {
    const approvedRequests = await this.enrollmentRepository.find({
      where: {
        tontineId,
        status: EnrollmentStatus.APPROVED,
      },
      select: ['userId'],
    });

    return approvedRequests.map(request => request.userId);
  }

  /**
   * Créer une invitation pour rejoindre une tontine
   */
  async createInvitation(
    tontineId: string,
    inviterUserId: string,
    invitationData: CreateInvitationDto
  ): Promise<InvitationResponse> {
    // Vérifier que la tontine existe
    const tontine = await this.activeTontineRepository.findOne({
      where: { id: tontineId }
    });

    if (!tontine) {
      throw new NotFoundException('Tontine non trouvée');
    }

    // Créer une demande d'enrollment
    const enrollmentRequest = this.enrollmentRepository.create({
      userId: inviterUserId, // Temporaire - sera mis à jour quand la personne s'inscrit
      tontineId,
      status: EnrollmentStatus.PENDING,
      preferredPaymentMethod: PaymentMethod.MOBILE_MONEY,
      message: `Invitation envoyée à ${invitationData.firstName} ${invitationData.lastName}`,
    });

    const savedRequest = await this.enrollmentRepository.save(enrollmentRequest);

    // Générer le token d'invitation
    const invitationToken = sign(
      {
        enrollmentId: savedRequest.id,
        tontineId,
        phoneNumber: invitationData.phoneNumber,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 jours
      },
      this.JWT_SECRET
    );

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
      id: savedRequest.id,
      invitationLink,
      qrCodeData,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
      
      const enrollmentRequest = await this.enrollmentRepository.findOne({
        where: { id: decoded.enrollmentId }
      });

      if (!enrollmentRequest) {
        throw new BadRequestException('Invitation invalide');
      }

      // Mettre à jour le statut selon la réponse
      if (responseData.response === 'accept') {
        enrollmentRequest.status = EnrollmentStatus.APPROVED;
        enrollmentRequest.message = `Accepté par ${responseData.userInfo.firstName} ${responseData.userInfo.lastName}`;
      } else {
        enrollmentRequest.status = EnrollmentStatus.REJECTED;
        enrollmentRequest.rejectionReason = 'Décliné par l\'invité';
      }

      await this.enrollmentRepository.save(enrollmentRequest);

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
    const enrollmentRequest = await this.enrollmentRepository.findOne({
      where: { 
        id: requestData.memberId,
        tontineId 
      }
    });

    if (!enrollmentRequest) {
      throw new NotFoundException('Demande non trouvée');
    }

    if (requestData.action === 'approve') {
      enrollmentRequest.status = EnrollmentStatus.APPROVED;
      enrollmentRequest.reviewedAt = new Date();
    } else {
      enrollmentRequest.status = EnrollmentStatus.REJECTED;
      enrollmentRequest.rejectionReason = requestData.reason || 'Rejeté par le créateur';
      enrollmentRequest.reviewedAt = new Date();
    }

    await this.enrollmentRepository.save(enrollmentRequest);

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
  async getTontineMembers(tontineId: string): Promise<MemberResponse[]> {
    const enrollmentRequests = await this.enrollmentRepository.find({
      where: { tontineId },
      relations: ['user'],
      order: { createdAt: 'ASC' }
    });

    return enrollmentRequests.map((request, index) => ({
      id: request.id,
      userId: request.userId,
      userName: request.user ? request.user.name : 'Utilisateur Inconnu',
      userPhone: request.user?.phone || 'Non renseigné',
      status: this.mapEnrollmentStatusToMemberStatus(request.status),
      joinedAt: request.status === EnrollmentStatus.APPROVED ? request.reviewedAt : request.createdAt,
      position: request.status === EnrollmentStatus.APPROVED ? index + 1 : undefined,
      // Champs additionnels pour la gestion
      tontineId: request.tontineId,
      firstName: request.user?.name?.split(' ')[0] || 'Prénom',
      lastName: request.user?.name?.split(' ').slice(1).join(' ') || 'Nom',
      email: request.user?.email,
      invitationMethod: InvitationMethod.MANUAL,
      invitedAt: request.createdAt,
      respondedAt: request.reviewedAt,
      approvedAt: request.reviewedAt
    }));
  }

  /**
   * Obtenir les détails complets de la tontine pour la page d'enrollment
   */
  async getTontineEnrollmentData(tontineId: string): Promise<TontineEnrollmentResponse> {
    // ✅ CORRECTION: Chercher par l'ID de l'active_tontine (pas tontineId)
    const activeTontineData = await this.activeTontineRepository.findOne({
      where: { id: tontineId }
    });

    if (!activeTontineData) {
      throw new NotFoundException('Tontine non trouvée');
    }

    // ✅ CORRECTION: Extraire members depuis le champ JSON
    const membersData = activeTontineData.members as any[] || [];
    
    // ✅ CORRECTION: Récupérer données utilisateurs pour chaque member
    const memberUserIds = membersData.map(member => member.userId).filter(id => id);
    const users = memberUserIds.length > 0 ? await this.userRepository.findByIds(memberUserIds) : [];
    
    // Créer un map pour accès rapide aux données utilisateur
    const userMap = new Map(users.map(user => [user.id, user]));

    // ✅ CORRECTION: Construire participations depuis JSON members + données users
    const participations: any[] = membersData.map((member, index) => {
      const user = userMap.get(member.userId);
      
      return {
        id: member.id || `member-${index}`,
        userId: member.userId,
        userName: user?.name || member.name || 'Utilisateur Inconnu',
        userPhone: user?.phone || member.phone || 'Non renseigné',
        status: 'joined' as const,
        joinedAt: member.joinedAt ? new Date(member.joinedAt) : activeTontineData.createdAt,
        position: member.position || index + 1,
        tontineId: tontineId,
        firstName: user?.name?.split(' ')[0] || member.firstName || 'Prénom',
        lastName: user?.name?.split(' ').slice(1).join(' ') || member.lastName || 'Nom',
        email: user?.email || member.email,
        invitationMethod: InvitationMethod.MANUAL,
        invitedAt: member.joinedAt ? new Date(member.joinedAt) : activeTontineData.createdAt,
        respondedAt: member.joinedAt ? new Date(member.joinedAt) : activeTontineData.createdAt,
        approvedAt: member.joinedAt ? new Date(member.joinedAt) : activeTontineData.createdAt
      };
    });

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    return {
      id: tontineId,
      name: activeTontineData.name, // ✅ Nom réel PostgreSQL "Famille Mballa"
      description: activeTontineData.description || 'Tontine des membres',
      objective: 'Financement de projets personnels',
      contributionAmount: Number(activeTontineData.contributionAmount) || 50000,
      frequency: (activeTontineData.frequency as 'weekly' | 'biweekly' | 'monthly') || 'monthly',
      maxParticipants: activeTontineData.maxMembers || 8,
      minParticipants: 3,
      enrollmentDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      plannedStartDate: activeTontineData.startDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: activeTontineData.status,
      currentParticipants: activeTontineData.currentMembers || participations.length,
      participations, // ✅ VRAIES données depuis JSON members + users PostgreSQL
      invitationLink: `${baseUrl}/join/${tontineId}`
    };
  }

  /**
   * Obtenir les statistiques d'enrollment d'une tontine
   */
  async getEnrollmentStats(tontineId: string, maxParticipants: number, minParticipants: number): Promise<EnrollmentStatsResponse> {
    // ✅ CORRECTION: Récupérer vraies données depuis active_tontines
    const activeTontineData = await this.activeTontineRepository.findOne({
      where: { id: tontineId }
    });

    if (!activeTontineData) {
      throw new NotFoundException('Tontine non trouvée');
    }

    // ✅ CORRECTION: Calculer stats depuis JSON members + enrollment_requests
    const membersData = activeTontineData.members as any[] || [];
    const currentMembers = membersData.length;

    // Compter les vraies demandes d'enrollment (si table utilisée)
    const [
      totalPending, 
      totalApproved,
      totalRejected
    ] = await Promise.all([
      this.enrollmentRepository.count({ where: { tontineId, status: EnrollmentStatus.PENDING } }),
      this.enrollmentRepository.count({ where: { tontineId, status: EnrollmentStatus.APPROVED } }),
      this.enrollmentRepository.count({ where: { tontineId, status: EnrollmentStatus.REJECTED } })
    ]);

    // ✅ CORRECTION: Utiliser vraies données active_tontines
    const totalJoined = currentMembers; // Participants actuels depuis JSON
    const totalInvited = totalPending + totalApproved + totalRejected + currentMembers;
    const remainingSpots = Math.max(0, activeTontineData.maxMembers - currentMembers);
    const canStartConfiguration = currentMembers >= minParticipants;

    return {
      totalInvited,
      totalPending,
      totalApproved,
      totalJoined, // ✅ 3 au lieu de 0
      totalRejected,
      remainingSpots, // ✅ 1 au lieu de 10 
      canStartConfiguration // ✅ true au lieu de false
    };
  }

  /**
   * Mapper les statuts enrollment vers les statuts membre pour compatibilité frontend
   */
  private mapEnrollmentStatusToMemberStatus(status: EnrollmentStatus): 'pending' | 'approved' | 'rejected' | 'joined' {
    switch (status) {
      case EnrollmentStatus.PENDING:
        return 'pending';
      case EnrollmentStatus.APPROVED:
        return 'joined'; // Dans notre logique, approved = joined
      case EnrollmentStatus.REJECTED:
        return 'rejected';
      case EnrollmentStatus.CANCELLED:
        return 'rejected';
      default:
        return 'pending';
    }
  }

  /**
   * Envoyer une invitation par SMS (simulation pour l'instant)
   */
  private async sendSmsInvitation(phoneNumber: string, invitationLink: string, firstName: string): Promise<void> {
    // TODO: Intégrer avec un service SMS réel (Twilio, etc.)
    console.log(`SMS envoyé à ${phoneNumber}:`);
    console.log(`Salut ${firstName}! Tu es invité(e) à rejoindre une tontine. Clique ici: ${invitationLink}`);
    
    return Promise.resolve();
  }
}