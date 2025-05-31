// backend/src/tontines/controllers/enrollment.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentService } from '../services/enrollment.service';
import {
  CreateInvitationDto,
  RespondToInvitationDto,
  ProcessMemberRequestDto,
  InvitationMethod,
  InvitationResponse,
  MemberResponse,
  EnrollmentStatsResponse,
  TontineEnrollmentResponse,
} from '../dto/enrollment.dto';

// TODO: Importer vos guards d'authentification existants
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { GetUser } from '../../auth/decorators/get-user.decorator';

@ApiTags('Enrollment')
@Controller('tontines/:tontineId/enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  /**
   * Créer une invitation pour rejoindre la tontine
   */
  @Post('invitations')
  @ApiOperation({ summary: 'Créer une invitation' })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ status: 201, description: 'Invitation créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async createInvitation(
    @Param('tontineId') tontineId: string,
    @Body() invitationData: CreateInvitationDto,
    // @GetUser() user: any // Récupérer l'utilisateur connecté
  ): Promise<InvitationResponse> {
    try {
      // TODO: Récupérer l'ID utilisateur depuis le token JWT
      const inviterUserId = 'temp-user-id'; // Remplacer par user.id
      
      return await this.enrollmentService.createInvitation(
        tontineId,
        inviterUserId,
        invitationData
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la création de l\'invitation',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Répondre à une invitation (page publique)
   */
  @Post('respond')
  @ApiOperation({ summary: 'Répondre à une invitation' })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ status: 200, description: 'Réponse enregistrée' })
  @ApiResponse({ status: 400, description: 'Token invalide ou expiré' })
  async respondToInvitation(
    @Param('tontineId') tontineId: string,
    @Body() responseData: RespondToInvitationDto
  ): Promise<{ success: boolean; message: string }> {
    try {
      return await this.enrollmentService.respondToInvitation(responseData);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la réponse à l\'invitation',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Approuver ou rejeter une demande de membre
   */
  @Put('members/process')
  @ApiOperation({ summary: 'Approuver ou rejeter un membre' })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ status: 200, description: 'Demande traitée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Membre non trouvé' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async processMemberRequest(
    @Param('tontineId') tontineId: string,
    @Body() requestData: ProcessMemberRequestDto
  ): Promise<{ success: boolean; message: string }> {
    try {
      return await this.enrollmentService.processMemberRequest(tontineId, requestData);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors du traitement de la demande',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtenir les données complètes pour la page d'enrollment
   */
  @Get()
  @ApiOperation({ summary: 'Obtenir les données de la page d\'enrollment' })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ status: 200, description: 'Données de la page d\'enrollment' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Tontine non trouvée' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async getTontineEnrollmentData(
    @Param('tontineId') tontineId: string
  ): Promise<TontineEnrollmentResponse> {
    try {
      return this.enrollmentService.getTontineEnrollmentData(tontineId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des données',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Inviter plusieurs personnes par téléphone (batch SMS)
   */
  @Post('invite-batch')
  @ApiOperation({ summary: 'Inviter plusieurs personnes par SMS' })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ status: 201, description: 'Invitations envoyées' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async inviteBatch(
    @Param('tontineId') tontineId: string,
    @Body() batchData: { phoneNumbers: string[]; message?: string }
  ): Promise<{ success: boolean; sent: number; errors: string[] }> {
    try {
      const inviterUserId = 'temp-user-id'; // TODO: Récupérer depuis JWT
      const results = [];
      const errors = [];

      for (const phoneNumber of batchData.phoneNumbers) {
        if (!phoneNumber.trim()) continue;

        try {
          const invitationData: CreateInvitationDto = {
            phoneNumber: phoneNumber.trim(),
            firstName: 'Invité', // Nom par défaut
            lastName: '',
            method: InvitationMethod.SMS
          };

          await this.enrollmentService.createInvitation(
            tontineId,
            inviterUserId,
            invitationData
          );
          results.push(phoneNumber);
        } catch (error) {
          errors.push(`${phoneNumber}: ${error.message}`);
        }
      }

      return {
        success: results.length > 0,
        sent: results.length,
        errors
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de l\'envoi des invitations',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtenir les statistiques d'enrollment
   */
  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques d\'enrollment' })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ status: 200, description: 'Statistiques d\'enrollment' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async getEnrollmentStats(
    @Param('tontineId') tontineId: string,
    @Query('maxParticipants') maxParticipants: string,
    @Query('minParticipants') minParticipants: string
  ): Promise<EnrollmentStatsResponse> {
    try {
      const maxP = parseInt(maxParticipants) || 10;
      const minP = parseInt(minParticipants) || 3;
      
      return this.enrollmentService.getEnrollmentStats(tontineId, maxP, minP);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des statistiques',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtenir les informations d'une tontine pour la page de participation
   */
  @Get('info')
  @ApiOperation({ summary: 'Obtenir les infos de la tontine (page publique)' })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ status: 200, description: 'Informations de la tontine' })
  @ApiResponse({ status: 404, description: 'Tontine non trouvée' })
  async getTontineInfo(
    @Param('tontineId') tontineId: string,
    @Query('token') token?: string
  ): Promise<any> {
    try {
      // TODO: Intégrer avec votre TontineService existant
      // Retourner les informations publiques de la tontine pour l'affichage
      // sur la page de participation (/tontines/:id/join)
      
      return {
        id: tontineId,
        name: 'Tontine Exemple', // À remplacer par les vraies données
        description: 'Description de la tontine',
        contributionAmount: 50000,
        frequency: 'monthly',
        maxParticipants: 10,
        plannedStartDate: new Date(),
        // Ne pas exposer d'informations sensibles
      };
    } catch (error) {
      throw new HttpException(
        'Tontine non trouvée',
        HttpStatus.NOT_FOUND
      );
    }
  }
} 
