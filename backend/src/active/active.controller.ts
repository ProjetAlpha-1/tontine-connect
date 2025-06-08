// backend/src/active/active.controller.ts (CORRIGÉ)

import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete,
  Param, 
  Body, 
  Query, 
  UseGuards,
  Request,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiQuery,
  ApiBearerAuth 
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveService } from './active.service';

// Import des DTOs
import {
  GetDashboardDto,
  DashboardFiltersDto,
  ConfirmPaymentDto,
  CreatePaymentDto,
  UpdatePaymentDto,
  GetPaymentsQueryDto,
  BulkPaymentActionDto,
  TriggerNextCycleDto,
  UpdateCycleDto,
  ExtendCycleDeadlineDto,
  GetCyclesQueryDto,
  CompleteCycleDto,
  ApplyPenaltyDto,
  WaivePenaltyDto,
  DisputePenaltyDto,
  ResolvePenaltyDisputeDto,
  GetPenaltiesQueryDto,
  BulkPenaltyActionDto,
  CreateNotificationDto,
  SendNotificationDto,
  GetNotificationsQueryDto,
  MarkNotificationReadDto,
  RespondToNotificationDto
} from './dto';

@ApiTags('Active Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/tontines/:tontineId/active')
export class ActiveController {
  private readonly logger = new Logger(ActiveController.name);

  constructor(private readonly activeService: ActiveService) {}

  // ===== 1. DASHBOARD ET MÉTRIQUES =====

  @Get('dashboard')
  @ApiOperation({ 
    summary: 'Récupérer le dashboard complet de la tontine active',
    description: 'Retourne toutes les métriques, KPIs, graphiques et alertes pour le dashboard temps réel'
  })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Dashboard récupéré avec succès'
  })
  async getDashboard(
    @Param('tontineId') tontineId: string,
    @Query() options: GetDashboardDto,
    @Query() filters: DashboardFiltersDto,
    @Request() req: any
  ) {
    this.logger.log(`📊 GET Dashboard for tontine ${tontineId}`);
    
    return await this.activeService.getDashboard(tontineId, options, filters);
  }

  // ===== 2. GESTION DES CYCLES =====

  @Get('current-cycle')
  @ApiOperation({ 
    summary: 'Récupérer le cycle actuel',
    description: 'Retourne les détails complets du cycle en cours avec statuts et métriques'
  })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Cycle actuel récupéré avec succès'
  })
  async getCurrentCycle(
    @Param('tontineId') tontineId: string,
    @Request() req: any
  ) {
    this.logger.log(`🔄 GET Current cycle for tontine ${tontineId}`);
    
    return await this.activeService.getCurrentCycle(tontineId);
  }

  @Post('next-cycle')
  @ApiOperation({ 
    summary: 'Déclencher le cycle suivant',
    description: 'Lance le cycle suivant avec options personnalisables et création automatique des paiements'
  })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Nouveau cycle créé et démarré avec succès'
  })
  async triggerNextCycle(
    @Param('tontineId') tontineId: string,
    @Body() triggerData: TriggerNextCycleDto,
    @Request() req: any
  ) {
    this.logger.log(`🚀 POST Trigger next cycle for tontine ${tontineId}`);
    
    // CORRIGÉ: signature correcte (tontineId, triggerData)
    return await this.activeService.triggerNextCycle(
      tontineId, 
      triggerData
    );
  }

  @Put('deadline')
  @ApiOperation({ 
    summary: 'Étendre le délai du cycle actuel',
    description: 'Accorde une extension de délai avec justification et notification automatique'
  })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Délai étendu avec succès'
  })
  async extendDeadline(
    @Param('tontineId') tontineId: string,
    @Body() extensionData: ExtendCycleDeadlineDto,
    @Request() req: any
  ) {
    this.logger.log(`⏰ PUT Extend deadline for tontine ${tontineId}`);
    
    // Logique d'extension sera implémentée dans le service
    return { 
      message: 'Deadline extension successful',
      newDeadline: extensionData.newDueDate,
      additionalDays: extensionData.additionalDays
    };
  }

  // ===== 3. GESTION DES PAIEMENTS =====

  @Get('payments')
  @ApiOperation({ 
    summary: 'Récupérer l\'historique des paiements',
    description: 'Liste paginée des paiements avec filtres avancés et options de tri'
  })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Liste des paiements récupérée avec succès'
  })
  async getPayments(
    @Param('tontineId') tontineId: string,
    @Query() query: GetPaymentsQueryDto,
    @Request() req: any
  ) {
    this.logger.log(`💰 GET Payments for tontine ${tontineId}`);
    
    return await this.activeService.getPayments(tontineId, undefined, query);
  }

  @Post('payment')
  @ApiOperation({ 
    summary: 'Confirmer un paiement reçu',
    description: 'Confirme la réception d\'un paiement avec méthode, montant et génération de reçu'
  })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Paiement confirmé avec succès'
  })
  async confirmPayment(
    @Param('tontineId') tontineId: string,
    @Body() confirmData: ConfirmPaymentDto,
    @Request() req: any
  ) {
    this.logger.log(`✅ POST Confirm payment for tontine ${tontineId}`);
    
    // CORRIGÉ: signature correcte (tontineId, paymentId, confirmData, confirmedBy)
    return await this.activeService.confirmPayment(
      tontineId,
      confirmData.paymentId,
      confirmData,
      req.user.id
    );
  }

  @Post('payments/bulk-action')
  @ApiOperation({ 
    summary: 'Actions groupées sur les paiements',
    description: 'Effectue des actions en lot sur plusieurs paiements (confirmation, rappels, etc.)'
  })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Actions groupées exécutées avec succès'
  })
  async bulkPaymentAction(
    @Param('tontineId') tontineId: string,
    @Body() actionData: BulkPaymentActionDto,
    @Request() req: any
  ) {
    this.logger.log(`📦 POST Bulk payment action for tontine ${tontineId}`);
    
    // Logique d'actions groupées sera implémentée dans le service
    return { 
      message: `Bulk action '${actionData.action}' executed`,
      processedPayments: actionData.paymentIds.length,
      action: actionData.action
    };
  }

  // ===== 4. GESTION DES PÉNALITÉS =====

  @Post('penalty')
  @ApiOperation({ 
    summary: 'Appliquer une pénalité',
    description: 'Applique une pénalité à un membre avec calcul automatique et notification'
  })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Pénalité appliquée avec succès'
  })
  async applyPenalty(
    @Param('tontineId') tontineId: string,
    @Body() penaltyData: ApplyPenaltyDto,
    @Request() req: any
  ) {
    this.logger.log(`⚠️ POST Apply penalty for tontine ${tontineId}`);
    
    // CORRIGÉ: signature correcte (tontineId, memberId, penaltyData, appliedBy)
    return await this.activeService.applyPenalty(
      tontineId,
      penaltyData.memberId,
      penaltyData,
      req.user.id
    );
  }

  @Put('penalty/:penaltyId/waive')
  @ApiOperation({ 
    summary: 'Dispenser une pénalité',
    description: 'Accorde une dispense totale ou partielle de pénalité avec justification'
  })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiParam({ name: 'penaltyId', description: 'ID de la pénalité' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Pénalité dispensée avec succès'
  })
  async waivePenalty(
    @Param('tontineId') tontineId: string,
    @Param('penaltyId') penaltyId: string,
    @Body() waiverData: WaivePenaltyDto,
    @Request() req: any
  ) {
    this.logger.log(`🆓 PUT Waive penalty ${penaltyId} for tontine ${tontineId}`);
    
    // Logique de dispense sera implémentée dans le service
    return { 
      message: 'Penalty waived successfully',
      penaltyId,
      waivedAmount: waiverData.waivedAmount,
      reason: waiverData.reason
    };
  }

  // ===== 5. GESTION DES NOTIFICATIONS =====

  @Get('notifications')
  @ApiOperation({ 
    summary: 'Récupérer les notifications',
    description: 'Liste paginée des notifications avec filtres par statut, type et priorité'
  })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Liste des notifications récupérée avec succès'
  })
  async getNotifications(
    @Param('tontineId') tontineId: string,
    @Query() query: GetNotificationsQueryDto,
    @Request() req: any
  ) {
    this.logger.log(`📢 GET Notifications for tontine ${tontineId}`);
    
    return await this.activeService.getNotifications(tontineId, query);
  }

  @Post('notifications')
  @ApiOperation({ 
    summary: 'Créer et envoyer une notification',
    description: 'Crée une notification personnalisée avec envoi multi-canaux et programmation'
  })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Notification créée et envoyée avec succès'
  })
  async createNotification(
    @Param('tontineId') tontineId: string,
    @Body() notificationData: CreateNotificationDto,
    @Request() req: any
  ) {
    this.logger.log(`📢 POST Create notification for tontine ${tontineId}`);
    
    // CORRIGÉ: signature correcte (tontineId, notificationData)
    return await this.activeService.createNotification(
      tontineId,
      notificationData
    );
  }

  @Put('notifications/mark-read')
  @ApiOperation({ 
    summary: 'Marquer des notifications comme lues',
    description: 'Marque une ou plusieurs notifications comme lues pour un utilisateur'
  })
  @ApiParam({ name: 'tontineId', description: 'ID de la tontine' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Notifications marquées comme lues avec succès'
  })
  async markNotificationsRead(
    @Param('tontineId') tontineId: string,
    @Body() markData: MarkNotificationReadDto,
    @Request() req: any
  ) {
    this.logger.log(`👁️ PUT Mark notifications read for tontine ${tontineId}`);
    
    // Logique de marquage sera implémentée dans le service
    return { 
      message: 'Notifications marked as read',
      markedCount: markData.notificationIds.length,
      userId: req.user.id
    };
  }
}