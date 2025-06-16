import { Controller, Get, Post, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ReputationService } from './reputation.service';

@ApiTags('reputation')
@Controller('reputation')
export class ReputationController {
  constructor(private readonly reputationService: ReputationService) {}

  // ✅ GET /reputation/events - Déjà fonctionnel selon diagnostic
  @Get('events')
  @ApiOperation({ summary: 'Récupérer les événements de réputation' })
  @ApiResponse({ status: 200, description: 'Liste des événements de réputation' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
  @ApiQuery({ name: 'tontineId', required: false, type: String, description: 'Filter by tontine ID' })
  async getReputationEvents(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('userId') userId?: string,
    @Query('tontineId') tontineId?: string,
  ) {
    return this.reputationService.getReputationEvents({
      page,
      limit,
      userId,
      tontineId,
    });
  }

  // 🔧 POST /reputation/events - CORRECTION DU PARSING PARAMÈTRES
  @Post('events')
  @ApiOperation({ summary: 'Créer un événement de réputation' })
  @ApiResponse({ status: 201, description: 'Événement de réputation créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiBody({
    description: 'Données de l\'événement de réputation',
    examples: {
      example1: {
        summary: 'Paiement à temps',
        value: {
          userId: '9031080a-3b68-43d5-ae2c-65c701bdbcc8',
          eventType: 'PAYMENT_ON_TIME',
          tontineId: 'd544af84-df40-44c7-8d33-f8f3341ef4cd',
          eventData: {
            amount: 50000,
            currency: 'FCFA'
          },
          description: 'Paiement mensuel effectué à temps'
        }
      }
    }
  })
  async createReputationEvent(@Body() body: any) {
    try {
      // 🔧 CORRECTION : Extraction correcte des paramètres du body
      const { userId, eventType, tontineId, eventData, description } = body;

      // 🔧 APPEL SERVICE AVEC PARAMÈTRES CORRECTEMENT ORDONNÉS
      const result = await this.reputationService.createReputationEvent({
        userId,        // ✅ userId dans userId
        eventType,     // ✅ eventType dans eventType  
        tontineId,     // ✅ tontineId dans tontineId
        eventData: eventData || {},
        description: description || `Événement ${eventType} pour utilisateur ${userId}`
      });

      return {
        success: true,
        message: 'Événement de réputation créé avec succès',
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de la création: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 📊 GET /reputation/users/:userId - Réputation d'un utilisateur
  @Get('users/:userId')
  @ApiOperation({ summary: 'Récupérer la réputation d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Réputation de l\'utilisateur' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur', type: String })
  async getUserReputation(@Param('userId') userId: string) {
    return this.reputationService.getUserReputation(userId);
  }

  // 📈 GET /reputation/tontines/:tontineId/stats
  @Get('tontines/:tontineId/stats')
  @ApiOperation({ summary: 'Statistiques de réputation d\'une tontine' })
  @ApiResponse({ status: 200, description: 'Statistiques de réputation de la tontine' })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine', type: String })
  async getTontineReputationStats(@Param('tontineId') tontineId: string) {
    return this.reputationService.getTontineReputationStats(tontineId);
  }

  // 🏆 GET /reputation/leaderboard
  @Get('leaderboard')
  @ApiOperation({ summary: 'Classement des utilisateurs par réputation' })
  @ApiResponse({ status: 200, description: 'Classement des utilisateurs' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'utilisateurs à retourner' })
  @ApiQuery({ name: 'tontineId', required: false, type: String, description: 'Filtrer par tontine' })
  async getReputationLeaderboard(
    @Query('limit') limit: number = 10,
    @Query('tontineId') tontineId?: string
  ) {
    return this.reputationService.getReputationLeaderboard(limit, tontineId);
  }
}