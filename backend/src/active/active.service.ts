// backend/src/active/active.service.ts (CORRIGÉ)

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ReputationEventTriggerService } from '../reputation/integration/reputation-event-trigger.service';
import { NotificationService } from '../notifications/notification.service';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { ActiveTontine, Cycle, Payment, Penalty } from './entities';
import { 
  ConfirmPaymentDto, 
  ApplyPenaltyDto, 
  ExtendCycleDeadlineDto,
  TriggerNextCycleDto 
} from './dto';

@Injectable()
export class ActiveService {
  private readonly logger = new Logger(ActiveService.name);

  constructor(
    @InjectRepository(ActiveTontine)
    private activeTontineRepository: Repository<ActiveTontine>,
    @InjectRepository(Cycle)
    private cycleRepository: Repository<Cycle>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Penalty)
    private penaltyRepository: Repository<Penalty>,
    private readonly reputationTrigger: ReputationEventTriggerService,
    private readonly notificationService: NotificationService,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  /**
   * MÉTHODES MANQUANTES ATTENDUES PAR LE CONTROLLER
   */

  // Dashboard method
  async getDashboard(tontineId: string, options?: any, filters?: any): Promise<any> {
    this.logger.debug(`Getting dashboard for tontine ${tontineId}`);
    
    try {
      const activeTontine = await this.getActiveTontine(tontineId);
      const currentCycle = await this.getCurrentCycle(tontineId);
      
      return {
        tontineId,
        status: activeTontine.status,
        currentCycle: currentCycle.cycleNumber,
        totalMembers: activeTontine.currentMembers,
        collectedAmount: currentCycle.collectedAmount,
        nextPaymentDate: activeTontine.nextPaymentDate,
        completionPercentage: activeTontine.completionPercentage,
        overviewStats: {
          completionRate: currentCycle.completionPercentage,
          participationRate: currentCycle.participatingMembers,
          onTimePayments: 78 // TODO: Calculate real value
        }
      };
    } catch (error) {
      this.logger.error(`Error getting dashboard: ${error.message}`);
      return {
        tontineId,
        status: 'error',
        error: error.message
      };
    }
  }

  // Payments method
  async getPayments(tontineId: string, cycleId?: string, query?: any): Promise<any[]> {
    this.logger.debug(`Getting payments for tontine ${tontineId}`);
    
    try {
      const whereConditions: any = {};
      
      if (cycleId) {
        whereConditions.cycleId = cycleId;
      } else {
        // Get current cycle payments
        const currentCycle = await this.getCurrentCycle(tontineId);
        whereConditions.cycleId = currentCycle.id;
      }

      const payments = await this.paymentRepository.find({
        where: whereConditions,
        relations: ['cycle'],
        order: { createdAt: 'DESC' }
      });

      return payments.map(payment => ({
        id: payment.id,
        memberId: payment.memberId,
        memberName: payment.memberName,
        amount: payment.amount,
        status: payment.status,
        dueDate: payment.dueDate,
        paidDate: payment.paidDate,
        isLate: payment.isLate,
        daysLate: payment.daysLate
      }));
    } catch (error) {
      this.logger.error(`Error getting payments: ${error.message}`);
      return [];
    }
  }

  // Notifications methods
  async getNotifications(tontineId: string, query?: any): Promise<any[]> {
    this.logger.debug(`Getting notifications for tontine ${tontineId}`);
    
    // TODO: Implement actual notification retrieval from database
    return [
      {
        id: 'notif-1',
        type: 'payment_reminder',
        title: 'Rappel de paiement',
        message: 'Votre paiement est dû dans 2 jours',
        createdAt: new Date(),
        isRead: false
      }
    ];
  }

  async createNotification(tontineId: string, notificationData: any): Promise<any> {
    this.logger.debug(`Creating notification for tontine ${tontineId}`);
    
    // TODO: Implement actual notification creation in database
    const notification = {
      id: `notif-${Date.now()}`,
      tontineId,
      ...notificationData,
      createdAt: new Date()
    };

    return notification;
  }

  // Make getCurrentCycle public and fix return type
  async getCurrentCycle(tontineId: string): Promise<Cycle> {
    const cycle = await this.cycleRepository.findOne({
      where: { 
        activeTontineId: tontineId, 
        status: 'active' 
      },
      relations: ['payments', 'penalties']
    });

    if (!cycle) {
      throw new NotFoundException('Cycle actuel non trouvé');
    }

    return cycle;
  }

  /**
   * GESTION DES PAIEMENTS AVEC INTÉGRATION RÉPUTATION
   */
  
  async confirmPayment(
    tontineId: string, 
    paymentId: string, 
    confirmData: ConfirmPaymentDto,
    confirmedBy: string
  ): Promise<void> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { id: paymentId },
        relations: ['cycle']
      });

      if (!payment) {
        throw new NotFoundException('Paiement non trouvé');
      }

      const wasLate = payment.dueDate < new Date();
      const daysLate = wasLate ? 
        Math.ceil((new Date().getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

      // Mettre à jour le paiement
      payment.status = 'confirmed';
      payment.paidDate = confirmData.paidDate ? new Date(confirmData.paidDate) : new Date();
      payment.confirmedDate = new Date();
      payment.confirmedBy = confirmedBy;
      payment.method = confirmData.method || '';
      payment.reference = confirmData.reference || '';
      payment.notes = confirmData.notes || confirmData.adminNotes || '';
      payment.daysLate = daysLate;
      payment.isLate = wasLate;

      await this.paymentRepository.save(payment);

      // 🚀 INTÉGRATION RÉPUTATION - Déclencher événement
      await this.reputationTrigger.onPaymentCompleted({
        userId: payment.memberId,
        tontineId: tontineId,
        amount: payment.amount,
        cycleNumber: payment.cycle.cycleNumber,
        dueDate: payment.dueDate,
        paidDate: payment.paidDate,
        isOnTime: !wasLate
      });

      // Mettre à jour les métriques du cycle
      await this.updateCycleMetrics(payment.cycle.id);

      // Vérifier si le cycle est complété
      await this.checkCycleCompletion(payment.cycle.id);

      // Notifications
      await this.sendPaymentConfirmationNotifications(payment, wasLate);

      this.logger.log(`Paiement ${paymentId} confirmé avec succès ${wasLate ? '(en retard)' : '(à temps)'}`);
    } catch (error) {
      this.logger.error(`Erreur lors de la confirmation de paiement: ${error.message}`);
      throw error;
    }
  }

  async applyPenalty(
    tontineId: string, 
    memberId: string, 
    penaltyData: ApplyPenaltyDto,
    appliedBy: string
  ): Promise<void> {
    try {
      const activeTontine = await this.getActiveTontine(tontineId);
      const currentCycle = await this.getCurrentCycle(tontineId);

      // Créer la pénalité
      const penalty = this.penaltyRepository.create({
        cycleId: currentCycle.id,
        memberId: memberId,
        memberName: '', // TODO: Get member name
        type: penaltyData.type,
        amount: penaltyData.amount,
        reason: penaltyData.reason,
        appliedBy: appliedBy,
        appliedDate: new Date(),
        status: 'applied'
      });

      await this.penaltyRepository.save(penalty);

      // 🚀 INTÉGRATION RÉPUTATION - Déclencher événement
      await this.reputationTrigger.onPenaltyApplied({
        userId: memberId,
        tontineId: tontineId,
        penaltyAmount: penaltyData.amount,
        reason: penaltyData.reason,
        cycleNumber: currentCycle.cycleNumber
      });

      // Mettre à jour le statut du paiement si applicable
      if (penaltyData.paymentId) {
        await this.updatePaymentWithPenalty(penaltyData.paymentId, penalty.id, penaltyData.amount);
      }

      // Notifications
      await this.sendPenaltyNotifications(memberId, penalty);

      this.logger.warn(`Pénalité de ${penaltyData.amount} appliquée au membre ${memberId}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'application de pénalité: ${error.message}`);
      throw error;
    }
  }

  /**
   * GESTION DES CYCLES AVEC INTÉGRATION RÉPUTATION
   */
  
  async triggerNextCycle(tontineId: string, triggerData: TriggerNextCycleDto): Promise<void> {
    try {
      const activeTontine = await this.getActiveTontine(tontineId);
      const currentCycle = await this.getCurrentCycle(tontineId);

      // Finaliser le cycle actuel
      await this.finalizeCycle(currentCycle);

      // Créer le nouveau cycle
      const nextCycle = await this.createNextCycle(activeTontine, currentCycle);

      // 🚀 INTÉGRATION RÉPUTATION - Événement cycle complété
      const cycleStats = await this.calculateCycleStats(currentCycle.id);
      await this.reputationTrigger.onCycleCompleted({
        tontineId: tontineId,
        cycleNumber: currentCycle.cycleNumber,
        payeeId: currentCycle.beneficiaryId,
        totalCollected: cycleStats.totalCollected,
        expectedAmount: cycleStats.expectedAmount,
        participationRate: cycleStats.participationRate,
        completionTime: cycleStats.completionTime
      });

      // 🚀 INTÉGRATION RÉPUTATION - Événement nouveau cycle
      await this.reputationTrigger.onCycleStarted({
        tontineId: tontineId,
        cycleNumber: nextCycle.cycleNumber,
        payeeId: nextCycle.beneficiaryId,
        expectedAmount: nextCycle.expectedAmount,
        memberIds: await this.getActiveMemberIds(tontineId)
      });

      // Notifications du nouveau cycle
      await this.sendNewCycleNotifications(nextCycle);

      this.logger.log(`Cycle ${nextCycle.cycleNumber} démarré pour tontine ${tontineId}`);
    } catch (error) {
      this.logger.error(`Erreur lors du déclenchement du cycle suivant: ${error.message}`);
      throw error;
    }
  }

  /**
   * SYSTÈME DE DÉTECTION AUTOMATIQUE DES RETARDS
   */
  
  async checkOverduePayments(): Promise<void> {
    try {
      const overduePayments = await this.paymentRepository.find({
        where: {
          status: 'pending',
          dueDate: LessThan(new Date())
        },
        relations: ['cycle']
      });

      for (const payment of overduePayments) {
        const daysOverdue = Math.ceil(
          (new Date().getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Marquer comme en retard
        payment.status = 'pending'; // Keep as pending but mark as late
        payment.isLate = true;
        payment.daysLate = daysOverdue;
        await this.paymentRepository.save(payment);

        // 🚀 INTÉGRATION RÉPUTATION - Événement paiement manqué
        await this.reputationTrigger.onPaymentMissed({
          userId: payment.memberId,
          tontineId: payment.cycle.activeTontineId,
          amount: payment.amount,
          cycleNumber: payment.cycle.cycleNumber,
          dueDate: payment.dueDate,
          daysOverdue: daysOverdue
        });

        // Notifications de retard
        await this.sendOverduePaymentNotifications(payment);
      }

      this.logger.log(`${overduePayments.length} paiements en retard traités`);
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification des retards: ${error.message}`);
    }
  }

  /**
   * MÉTHODES UTILITAIRES PRIVÉES
   */
  
  private async updateCycleMetrics(cycleId: string): Promise<void> {
    const cycle = await this.cycleRepository.findOne({
      where: { id: cycleId },
      relations: ['payments']
    });

    if (!cycle) return;

    const paidPayments = cycle.payments.filter(p => p.status === 'confirmed');
    const collectedAmount = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const participatingMembers = paidPayments.length;
    const participationRate = (participatingMembers / cycle.payments.length) * 100;

    cycle.collectedAmount = collectedAmount;
    cycle.participatingMembers = participatingMembers;
    cycle.completionPercentage = (collectedAmount / cycle.expectedAmount) * 100;

    await this.cycleRepository.save(cycle);
  }

  private async checkCycleCompletion(cycleId: string): Promise<void> {
    const cycle = await this.cycleRepository.findOne({
      where: { id: cycleId },
      relations: ['payments']
    });

    if (!cycle) return;

    const allPaymentsCompleted = cycle.payments.every(p => 
      p.status === 'confirmed' || p.status === 'failed'
    );

    if (allPaymentsCompleted && cycle.status !== 'completed') {
      cycle.status = 'completed';
      cycle.completedDate = new Date();
      await this.cycleRepository.save(cycle);

      // Notifications de fin de cycle
      await this.sendCycleCompletionNotifications(cycle);
    }
  }

  private async calculateCycleStats(cycleId: string) {
    const cycle = await this.cycleRepository.findOne({
      where: { id: cycleId },
      relations: ['payments']
    });

    if (!cycle) {
      return {
        totalCollected: 0,
        expectedAmount: 0,
        participationRate: 0,
        completionTime: 0
      };
    }

    const totalCollected = cycle.payments
      .filter(p => p.status === 'confirmed')
      .reduce((sum, p) => sum + p.amount, 0);

    const participationRate = (cycle.participatingMembers / cycle.payments.length) * 100;
    const completionTime = cycle.completedDate 
      ? Math.ceil((cycle.completedDate.getTime() - cycle.startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      totalCollected,
      expectedAmount: cycle.expectedAmount,
      participationRate,
      completionTime
    };
  }

  /**
   * MÉTHODES DE NOTIFICATION
   */
  
  private async sendPaymentConfirmationNotifications(payment: Payment, wasLate: boolean): Promise<void> {
    // Notification au membre
    await this.notificationService.sendToUser(payment.memberId, {
      type: 'payment_confirmed',
      title: 'Paiement confirmé',
      message: `Votre paiement de ${payment.amount} FCFA a été confirmé${wasLate ? ' (en retard)' : ''}`,
      data: { paymentId: payment.id, wasLate }
    });

    // Notification au bénéficiaire du cycle
    if (payment.cycle.beneficiaryId !== payment.memberId) {
      await this.notificationService.sendToUser(payment.cycle.beneficiaryId, {
        type: 'payment_received',
        title: 'Paiement reçu',
        message: `Paiement de ${payment.amount} FCFA reçu de ${payment.memberName}`,
        data: { paymentId: payment.id, fromMember: payment.memberName }
      });
    }
  }

  private async sendPenaltyNotifications(memberId: string, penalty: Penalty): Promise<void> {
    await this.notificationService.sendToUser(memberId, {
      type: 'penalty_applied',
      title: 'Pénalité appliquée',
      message: `Une pénalité de ${penalty.amount} FCFA a été appliquée: ${penalty.reason}`,
      data: { penaltyId: penalty.id, amount: penalty.amount, reason: penalty.reason }
    });
  }

  private async sendNewCycleNotifications(cycle: Cycle): Promise<void> {
    // Notification au nouveau bénéficiaire
    await this.notificationService.sendToUser(cycle.beneficiaryId, {
      type: 'cycle_beneficiary',
      title: 'Vous êtes le bénéficiaire !',
      message: `Cycle ${cycle.cycleNumber} commencé - Vous recevrez ${cycle.expectedAmount} FCFA`,
      data: { cycleId: cycle.id, cycleNumber: cycle.cycleNumber, expectedAmount: cycle.expectedAmount }
    });

    // Notification à tous les autres membres
    const memberIds = await this.getActiveMemberIds(cycle.activeTontineId);
    const otherMembers = memberIds.filter(id => id !== cycle.beneficiaryId);

    for (const memberId of otherMembers) {
      await this.notificationService.sendToUser(memberId, {
        type: 'new_cycle',
        title: 'Nouveau cycle commencé',
        message: `Cycle ${cycle.cycleNumber} - Paiement de ${cycle.expectedAmount / memberIds.length} FCFA requis avant le ${cycle.endDate.toLocaleDateString()}`,
        data: { 
          cycleId: cycle.id, 
          cycleNumber: cycle.cycleNumber, 
          dueDate: cycle.dueDate,
          paymentAmount: cycle.expectedAmount / memberIds.length,
          beneficiary: cycle.beneficiaryName 
        }
      });
    }
  }

  private async sendOverduePaymentNotifications(payment: Payment): Promise<void> {
    await this.notificationService.sendToUser(payment.memberId, {
      type: 'payment_overdue',
      title: 'Paiement en retard',
      message: `Votre paiement de ${payment.amount} FCFA est en retard de ${payment.daysLate} jours`,
      data: { 
        paymentId: payment.id, 
        amount: payment.amount, 
        daysLate: payment.daysLate,
        dueDate: payment.dueDate 
      }
    });

    // Notification au gestionnaire/admin
    await this.notificationService.sendToAdmins(payment.cycle.activeTontineId, {
      type: 'member_payment_overdue',
      title: 'Membre en retard',
      message: `${payment.memberName} a un paiement en retard de ${payment.daysLate} jours`,
      data: { 
        memberId: payment.memberId,
        memberName: payment.memberName,
        paymentId: payment.id,
        daysLate: payment.daysLate 
      }
    });
  }

  private async sendCycleCompletionNotifications(cycle: Cycle): Promise<void> {
    const memberIds = await this.getActiveMemberIds(cycle.activeTontineId);
    
    for (const memberId of memberIds) {
      await this.notificationService.sendToUser(memberId, {
        type: 'cycle_completed',
        title: 'Cycle terminé',
        message: `Cycle ${cycle.cycleNumber} terminé avec succès ! Montant distribué: ${cycle.collectedAmount} FCFA`,
        data: { 
          cycleId: cycle.id, 
          cycleNumber: cycle.cycleNumber, 
          collectedAmount: cycle.collectedAmount,
          participationRate: cycle.completionPercentage 
        }
      });
    }
  }

  /**
   * MÉTHODES UTILITAIRES PRIVÉES SUPPLÉMENTAIRES
   */
  
  private async getActiveTontine(tontineId: string): Promise<ActiveTontine> {
    const tontine = await this.activeTontineRepository.findOne({
      where: { id: tontineId, status: 'active' },
      relations: ['cycles']
    });

    if (!tontine) {
      throw new NotFoundException('Tontine active non trouvée');
    }

    return tontine;
  }

  private async getActiveMemberIds(tontineId: string): Promise<string[]> {
    try {
      return await this.enrollmentService.getActiveMemberIds(tontineId);
    } catch (error) {
      this.logger.error(`Error getting active member IDs: ${error.message}`);
      return [];
    }
  }

  private async updatePaymentWithPenalty(paymentId: string, penaltyId: string, penaltyAmount: number): Promise<void> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
    if (payment) {
      payment.penaltyAmount = penaltyAmount;
      payment.penaltyId = penaltyId;
      await this.paymentRepository.save(payment);
    }
  }

  private async finalizeCycle(cycle: Cycle): Promise<void> {
    cycle.status = 'completed';
    cycle.completedDate = new Date();
    
    // Calculer les métriques finales
    const stats = await this.calculateCycleStats(cycle.id);
    cycle.collectedAmount = stats.totalCollected;
    cycle.completionPercentage = (stats.totalCollected / stats.expectedAmount) * 100;
    
    await this.cycleRepository.save(cycle);
  }

  private async createNextCycle(activeTontine: ActiveTontine, currentCycle: Cycle): Promise<Cycle> {
    const nextCycleNumber = currentCycle.cycleNumber + 1;
    const memberIds = await this.getActiveMemberIds(activeTontine.id);
    const nextPayeeIndex = (currentCycle.cycleNumber) % memberIds.length;
    const nextPayeeId = memberIds[nextPayeeIndex];

    const nextCycle = this.cycleRepository.create({
      cycleNumber: nextCycleNumber,
      activeTontineId: activeTontine.id,
      beneficiaryId: nextPayeeId,
      beneficiaryName: `Member ${nextPayeeId}`, // TODO: Get real name
      startDate: new Date(),
      endDate: this.calculateCycleEndDate(activeTontine.cycleInterval),
      dueDate: this.calculatePaymentDueDate(activeTontine.paymentInterval),
      expectedAmount: activeTontine.contributionAmount * memberIds.length,
      status: 'active'
    });

    const savedCycle = await this.cycleRepository.save(nextCycle);

    // Créer les paiements pour tous les membres
    await this.createCyclePayments(savedCycle, memberIds);

    // Mettre à jour la tontine active
    activeTontine.currentCycleNumber = nextCycleNumber;
    activeTontine.nextPaymentDate = savedCycle.dueDate;
    
    await this.activeTontineRepository.save(activeTontine);

    return savedCycle;
  }

  private async createCyclePayments(cycle: Cycle, memberIds: string[]): Promise<void> {
    const payments = memberIds.map(memberId => ({
      cycleId: cycle.id,
      memberId: memberId,
      memberName: `Member ${memberId}`, // TODO: Get real name
      amount: cycle.expectedAmount / memberIds.length,
      expectedAmount: cycle.expectedAmount / memberIds.length,
      dueDate: cycle.dueDate,
      status: 'pending' as const
    }));

    await this.paymentRepository.save(payments);
  }

  private calculateCycleEndDate(intervalType: string): Date {
    const endDate = new Date();
    switch (intervalType) {
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      default:
        endDate.setDate(endDate.getDate() + 7);
    }
    return endDate;
  }

  private calculatePaymentDueDate(intervalType: string): Date {
    const dueDate = new Date();
    switch (intervalType) {
      case 'weekly':
        dueDate.setDate(dueDate.getDate() + 5);
        break;
      case 'monthly':
        dueDate.setDate(dueDate.getDate() + 25);
        break;
      default:
        dueDate.setDate(dueDate.getDate() + 5);
    }
    return dueDate;
  }
}