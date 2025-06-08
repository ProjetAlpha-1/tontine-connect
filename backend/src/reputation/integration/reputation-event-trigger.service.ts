// backend/src/reputation/integration/reputation-event-trigger.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ReputationService } from '../reputation.service';
import { 
  IReputationEvent,
  EventSeverity 
} from '../interfaces/reputation-event.interface';
import { 
  ReputationEventType,
  EventCategory 
} from '../types/reputation-types';

// Interfaces temporaires simplifiées pour le service
interface UserReputationEvent {
  type: ReputationEventType;
  userId: string;
  tontineId: string;
  timestamp: Date;
  data: any;
  impact: {
    reputationChange: number;
    category: string;
    reason: string;
  };
}

interface TontineReputationEvent {
  type: ReputationEventType;
  tontineId: string;
  timestamp: Date;
  data: any;
}

@Injectable()
export class ReputationEventTriggerService {
  private readonly logger = new Logger(ReputationEventTriggerService.name);

  constructor(
    private readonly reputationService: ReputationService,
  ) {}

  /**
   * ÉVÉNEMENTS LIÉS AUX PAIEMENTS
   */
  
  // Paiement effectué à temps
  async onPaymentCompleted(data: {
    userId: string;
    tontineId: string;
    amount: number;
    cycleNumber: number;
    dueDate: Date;
    paidDate: Date;
    isOnTime: boolean;
  }): Promise<void> {
    try {
      const eventData: UserReputationEvent = {
        type: data.isOnTime ? ReputationEventType.PAYMENT_ON_TIME : ReputationEventType.PAYMENT_LATE,
        userId: data.userId,
        tontineId: data.tontineId,
        timestamp: new Date(),
        data: {
          amount: data.amount,
          cycleNumber: data.cycleNumber,
          dueDate: data.dueDate,
          paidDate: data.paidDate,
          daysLate: data.isOnTime ? 0 : Math.ceil((data.paidDate.getTime() - data.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
        },
        impact: {
          reputationChange: data.isOnTime ? 15 : -10,
          category: 'payment_reliability',
          reason: data.isOnTime ? 'Paiement effectué à temps' : `Paiement en retard de ${Math.ceil((data.paidDate.getTime() - data.dueDate.getTime()) / (1000 * 60 * 60 * 24))} jours`
        }
      };

      await this.reputationService.recordEvent(eventData);
      
      // Mettre à jour la réputation de la tontine aussi
      await this.updateTontineHealthScore(data.tontineId, 'payment_completion');
      
      this.logger.log(`Événement paiement enregistré pour utilisateur ${data.userId}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'enregistrement de l'événement paiement: ${error.message}`);
    }
  }

  // Paiement manqué
  async onPaymentMissed(data: {
    userId: string;
    tontineId: string;
    amount: number;
    cycleNumber: number;
    dueDate: Date;
    daysOverdue: number;
  }): Promise<void> {
    try {
      const eventData: UserReputationEvent = {
        type: ReputationEventType.PAYMENT_MISSED,
        userId: data.userId,
        tontineId: data.tontineId,
        timestamp: new Date(),
        data: {
          amount: data.amount,
          cycleNumber: data.cycleNumber,
          dueDate: data.dueDate,
          daysOverdue: data.daysOverdue,
        },
        impact: {
          reputationChange: -25,
          category: 'payment_reliability',
          reason: `Paiement manqué - en retard de ${data.daysOverdue} jours`
        }
      };

      await this.reputationService.recordEvent(eventData);
      await this.updateTontineHealthScore(data.tontineId, 'payment_missed');
      
      this.logger.warn(`Paiement manqué enregistré pour utilisateur ${data.userId}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'enregistrement du paiement manqué: ${error.message}`);
    }
  }

  /**
   * ÉVÉNEMENTS LIÉS AUX PÉNALITÉS
   */
  
  async onPenaltyApplied(data: {
    userId: string;
    tontineId: string;
    penaltyAmount: number;
    reason: string;
    cycleNumber: number;
  }): Promise<void> {
    try {
      const eventData: UserReputationEvent = {
        type: ReputationEventType.PENALTY_APPLIED,
        userId: data.userId,
        tontineId: data.tontineId,
        timestamp: new Date(),
        data: {
          penaltyAmount: data.penaltyAmount,
          reason: data.reason,
          cycleNumber: data.cycleNumber,
        },
        impact: {
          reputationChange: -20,
          category: 'compliance',
          reason: `Pénalité appliquée: ${data.reason}`
        }
      };

      await this.reputationService.recordEvent(eventData);
      await this.updateTontineHealthScore(data.tontineId, 'penalty_applied');
      
      this.logger.warn(`Pénalité appliquée et enregistrée pour utilisateur ${data.userId}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'enregistrement de la pénalité: ${error.message}`);
    }
  }

  /**
   * ÉVÉNEMENTS LIÉS AUX CYCLES
   */
  
  // Début d'un nouveau cycle
  async onCycleStarted(data: {
    tontineId: string;
    cycleNumber: number;
    payeeId: string;
    expectedAmount: number;
    memberIds: string[];
  }): Promise<void> {
    try {
      // Événement pour le bénéficiaire du cycle (utilisons CYCLE_COMPLETION à la place)
      const payeeEventData: UserReputationEvent = {
        type: ReputationEventType.CYCLE_COMPLETION,
        userId: data.payeeId,
        tontineId: data.tontineId,
        timestamp: new Date(),
        data: {
          cycleNumber: data.cycleNumber,
          expectedAmount: data.expectedAmount,
        },
        impact: {
          reputationChange: 5,
          category: 'participation',
          reason: `Bénéficiaire du cycle ${data.cycleNumber}`
        }
      };

      await this.reputationService.recordEvent(payeeEventData);

      // Événement pour la tontine (utilisons un événement générique)
      const tontineEventData: TontineReputationEvent = {
        type: ReputationEventType.CYCLE_COMPLETION,
        tontineId: data.tontineId,
        timestamp: new Date(),
        data: {
          cycleNumber: data.cycleNumber,
          activeMembers: data.memberIds.length,
          expectedAmount: data.expectedAmount,
        }
      };

      await this.reputationService.recordTontineEvent(tontineEventData);
      
      this.logger.log(`Nouveau cycle ${data.cycleNumber} démarré pour tontine ${data.tontineId}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'enregistrement du début de cycle: ${error.message}`);
    }
  }

  // Cycle complété avec succès
  async onCycleCompleted(data: {
    tontineId: string;
    cycleNumber: number;
    payeeId: string;
    totalCollected: number;
    expectedAmount: number;
    participationRate: number;
    completionTime: number; // en jours
  }): Promise<void> {
    try {
      const success = data.totalCollected >= data.expectedAmount;
      const efficiency = data.participationRate;

      // Événement pour le bénéficiaire
      const payeeEventData: UserReputationEvent = {
        type: success ? ReputationEventType.CYCLE_COMPLETION : ReputationEventType.CYCLE_COMPLETION,
        userId: data.payeeId,
        tontineId: data.tontineId,
        timestamp: new Date(),
        data: {
          cycleNumber: data.cycleNumber,
          collectedAmount: data.totalCollected,
          expectedAmount: data.expectedAmount,
          participationRate: data.participationRate,
          completionTime: data.completionTime,
        },
        impact: {
          reputationChange: success ? 20 : 5,
          category: 'leadership',
          reason: success ? 'Cycle complété avec succès' : 'Cycle partiellement complété'
        }
      };

      await this.reputationService.recordEvent(payeeEventData);

      // Événement pour la tontine
      await this.updateTontineHealthScore(data.tontineId, 'cycle_completion', {
        success,
        efficiency,
        completionTime: data.completionTime
      });
      
      this.logger.log(`Cycle ${data.cycleNumber} ${success ? 'complété' : 'partiellement complété'} pour tontine ${data.tontineId}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'enregistrement de la completion de cycle: ${error.message}`);
    }
  }

  /**
   * ÉVÉNEMENTS LIÉS À LA PARTICIPATION
   */
  
  // Membre rejoint une tontine
  async onMemberJoined(data: {
    userId: string;
    tontineId: string;
    joinDate: Date;
  }): Promise<void> {
    try {
      const eventData: UserReputationEvent = {
        type: ReputationEventType.MEMBER_INVITATION, // Utilisons un type existant
        userId: data.userId,
        tontineId: data.tontineId,
        timestamp: new Date(),
        data: {
          joinDate: data.joinDate,
        },
        impact: {
          reputationChange: 10,
          category: 'participation',
          reason: 'Adhésion à une nouvelle tontine'
        }
      };

      await this.reputationService.recordEvent(eventData);
      
      this.logger.log(`Nouveau membre ${data.userId} rejoint la tontine ${data.tontineId}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'enregistrement de l'adhésion: ${error.message}`);
    }
  }

  // Membre quitte une tontine
  async onMemberLeft(data: {
    userId: string;
    tontineId: string;
    reason: 'voluntary' | 'expelled' | 'inactive';
    leaveDate: Date;
  }): Promise<void> {
    try {
      const impactMap = {
        voluntary: { change: -5, reason: 'Départ volontaire de la tontine' },
        expelled: { change: -50, reason: 'Exclusion de la tontine' },
        inactive: { change: -30, reason: 'Exclusion pour inactivité' }
      };

      const impact = impactMap[data.reason];

      const eventData: UserReputationEvent = {
        type: ReputationEventType.TONTINE_ABANDONMENT, // Utilisons un type existant
        userId: data.userId,
        tontineId: data.tontineId,
        timestamp: new Date(),
        data: {
          reason: data.reason,
          leaveDate: data.leaveDate,
        },
        impact: {
          reputationChange: impact.change,
          category: 'participation',
          reason: impact.reason
        }
      };

      await this.reputationService.recordEvent(eventData);
      
      this.logger.warn(`Membre ${data.userId} a quitté la tontine ${data.tontineId} (${data.reason})`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'enregistrement du départ: ${error.message}`);
    }
  }

  /**
   * MISE À JOUR DE LA SANTÉ DES TONTINES
   */
  
  private async updateTontineHealthScore(
    tontineId: string, 
    eventType: string, 
    additionalData?: any
  ): Promise<void> {
    try {
      // Utiliser la méthode correcte
      await this.reputationService.calculateTontineReputation(tontineId);
      
      this.logger.debug(`Score de santé mis à jour pour tontine ${tontineId} suite à ${eventType}`);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du score de tontine: ${error.message}`);
    }
  }

  /**
   * MÉTHODES D'ÉVALUATION AUTOMATIQUE
   */
  
  // Évaluer la performance globale d'un membre sur une période
  async evaluateMemberPerformance(userId: string, tontineId: string, periodDays: number = 30): Promise<void> {
    try {
      // Cette méthode sera appelée périodiquement pour ajuster la réputation
      // basée sur la performance générale
      const performance = await this.calculateMemberPerformance(userId, tontineId, periodDays);
      
      if (performance.shouldAdjust) {
        const eventData: UserReputationEvent = {
          type: ReputationEventType.REPUTATION_REVIEW, // Utilisons un type existant
          userId: userId,
          tontineId: tontineId,
          timestamp: new Date(),
          data: {
            period: periodDays,
            metrics: performance.metrics,
          },
          impact: {
            reputationChange: performance.adjustment,
            category: 'overall_performance',
            reason: performance.reason
          }
        };

        await this.reputationService.recordEvent(eventData);
      }
    } catch (error) {
      this.logger.error(`Erreur lors de l'évaluation de performance: ${error.message}`);
    }
  }

  private async calculateMemberPerformance(userId: string, tontineId: string, periodDays: number) {
    // Logique de calcul de performance
    // Cette méthode analyserait l'historique des paiements, participations, etc.
    return {
      shouldAdjust: false,
      adjustment: 0,
      reason: '',
      metrics: {}
    };
  }
}