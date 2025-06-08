// backend/src/reputation/algorithms/reputation-calculator.ts

import { Injectable, Logger } from '@nestjs/common';
import { 
  ReputationLevel, 
  ReputationEventType,
  ReputationWeight,
  DEFAULT_REPUTATION_WEIGHTS,
  REPUTATION_LEVEL_THRESHOLDS,
  TrendDirection,
  RiskLevel,
  EventSeverity
} from '../types/reputation-types';
import { 
  IUserReputation, 
  IUserBadge 
} from '../interfaces/user-reputation.interface';
import { 
  IReputationEvent,
  IEventMultipliers,
  IContextualFactors
} from '../interfaces/reputation-event.interface';

/**
 * 🧮 Calculateur Principal de Réputation - Tontine Connect v0.6.0
 * 
 * Moteur sophistiqué qui calcule les scores de réputation basé sur :
 * - Algorithmes multi-facteurs pondérés
 * - Décroissance temporelle intelligente
 * - Multiplicateurs contextuels dynamiques
 * - Prédictions basées sur les tendances
 */

@Injectable()
export class ReputationCalculator {
  private readonly logger = new Logger(ReputationCalculator.name);
  
  // =====================================
  // 🎯 CONFIGURATION DES ALGORITHMES
  // =====================================
  
  // Version de l'algorithme pour traçabilité
  private readonly ALGORITHM_VERSION = '1.0.0';
  
  // Impacts de base par type d'événement
  private readonly BASE_EVENT_IMPACTS: Record<ReputationEventType, number> = {
    // Événements positifs
    [ReputationEventType.PAYMENT_ON_TIME]: 10,
    [ReputationEventType.PAYMENT_EARLY]: 15,
    [ReputationEventType.CYCLE_COMPLETION]: 25,
    [ReputationEventType.TONTINE_COMPLETION]: 50,
    [ReputationEventType.MEMBER_INVITATION]: 20,
    [ReputationEventType.DISPUTE_RESOLUTION]: 30,
    [ReputationEventType.HELP_PROVIDED]: 15,
    [ReputationEventType.POSITIVE_FEEDBACK]: 10,
    
    // Événements négatifs
    [ReputationEventType.PAYMENT_LATE]: -15,
    [ReputationEventType.PAYMENT_MISSED]: -30,
    [ReputationEventType.PENALTY_APPLIED]: -20,
    [ReputationEventType.TONTINE_ABANDONMENT]: -50,
    [ReputationEventType.DISPUTE_CAUSED]: -25,
    [ReputationEventType.NEGATIVE_FEEDBACK]: -10,
    [ReputationEventType.RULE_VIOLATION]: -35,
    
    // Événements neutres
    [ReputationEventType.REPUTATION_REVIEW]: 0,
    [ReputationEventType.MANUAL_ADJUSTMENT]: 0,
    [ReputationEventType.BADGE_AWARDED]: 5,
    [ReputationEventType.LEVEL_CHANGED]: 0
  };

  // Multiplicateurs de sévérité
  private readonly SEVERITY_MULTIPLIERS: Record<EventSeverity, number> = {
    [EventSeverity.MINOR]: 0.5,
    [EventSeverity.MODERATE]: 1.0,
    [EventSeverity.MAJOR]: 1.5,
    [EventSeverity.CRITICAL]: 2.0,
    [EventSeverity.EXCEPTIONAL]: 3.0
  };

  // =====================================
  // 🏆 CALCUL DU SCORE PRINCIPAL
  // =====================================

  /**
   * Calcule le score de réputation complet d'un utilisateur
   */
  async calculateUserScore(
    currentReputation: IUserReputation,
    recentEvents: IReputationEvent[],
    customWeights?: Partial<ReputationWeight>
  ): Promise<number> {
    try {
      this.logger.debug(`Calculating reputation score for user ${currentReputation.userId}`);
      
      const weights = { ...DEFAULT_REPUTATION_WEIGHTS, ...customWeights };
      
      // 1. Calcul des scores par catégorie
      const categoryScores = this.calculateCategoryScores(currentReputation);
      
      // 2. Application des poids
      const weightedScore = this.applyWeights(categoryScores, weights);
      
      // 3. Application des multiplicateurs d'événements récents
      const eventMultiplier = this.calculateRecentEventsMultiplier(recentEvents, currentReputation);
      
      // 4. Application de la décroissance temporelle
      const temporalDecay = this.calculateTemporalDecay(currentReputation.lastActivity);
      
      // 5. Bonus d'ancienneté et d'expérience
      const experienceBonus = this.calculateExperienceBonus(currentReputation);
      
      // 6. Calcul final
      const rawScore = weightedScore * eventMultiplier * temporalDecay + experienceBonus;
      const finalScore = Math.max(0, Math.min(1000, Math.round(rawScore)));
      
      this.logger.debug(`Score calculation result: ${finalScore} (weighted: ${weightedScore}, multiplier: ${eventMultiplier}, decay: ${temporalDecay}, bonus: ${experienceBonus})`);
      
      return finalScore;
      
    } catch (error) {
      this.logger.error(`Error calculating user score: ${error.message}`, error.stack);
      return currentReputation.score || 500; // Retourne le score actuel en cas d'erreur
    }
  }

  /**
   * Calcule les scores par catégorie de réputation
   */
  private calculateCategoryScores(reputation: IUserReputation): Record<string, number> {
    return {
      payment: this.calculatePaymentScore(reputation),
      participation: this.calculateParticipationScore(reputation),
      completion: this.calculateCompletionScore(reputation),
      social: this.calculateSocialScore(reputation),
      experience: this.calculateExperienceScore(reputation),
      penalty: this.calculatePenaltyScore(reputation)
    };
  }

  /**
   * Calcule le score de ponctualité des paiements (35% du score total)
   */
  private calculatePaymentScore(reputation: IUserReputation): number {
    if (!reputation.totalPayments || reputation.totalPayments === 0) {
      return 500; // Score neutre pour nouveaux utilisateurs
    }

    // Score de base sur la ponctualité
    const punctualityRate = reputation.onTimePayments / reputation.totalPayments;
    const punctualityScore = punctualityRate * 600; // Max 600 points

    // Bonus pour paiements en avance
    const earlyRate = reputation.earlyPayments / reputation.totalPayments;
    const earlyBonus = Math.min(100, earlyRate * 200);

    // Malus pour retards
    const lateRate = reputation.latePayments / reputation.totalPayments;
    const latePenalty = Math.min(200, lateRate * 400);

    // Malus pour paiements manqués
    const missedRate = reputation.missedPayments / reputation.totalPayments;
    const missedPenalty = Math.min(300, missedRate * 600);

    // Bonus de consistance (si plus de 10 paiements avec >90% ponctualité)
    const consistencyBonus = (reputation.totalPayments >= 10 && punctualityRate >= 0.9) ? 50 : 0;

    const finalScore = Math.max(0, punctualityScore + earlyBonus - latePenalty - missedPenalty + consistencyBonus);
    
    this.logger.debug(`Payment score: ${finalScore} (punctuality: ${punctualityScore}, early: ${earlyBonus}, late: -${latePenalty}, missed: -${missedPenalty}, consistency: ${consistencyBonus})`);
    
    return finalScore;
  }

  /**
   * Calcule le score de participation (25% du score total)
   */
  private calculateParticipationScore(reputation: IUserReputation): number {
    // Score de base sur le taux de participation
    const baseScore = (reputation.participationRate || 0) * 6; // Max 600 points

    // Bonus pour participation dans plusieurs tontines
    const diversificationBonus = Math.min(100, reputation.activeTontines * 25);

    // Bonus pour assiduité (taux de présence)
    const attendanceBonus = Math.min(80, (reputation.attendanceRate || 0) * 0.8);

    // Score d'engagement social
    const engagementBonus = Math.min(120, (reputation.engagementScore || 0) * 1.2);

    const finalScore = Math.min(800, baseScore + diversificationBonus + attendanceBonus + engagementBonus);
    
    return finalScore;
  }

  /**
   * Calcule le score de complétion (20% du score total)
   */
  private calculateCompletionScore(reputation: IUserReputation): number {
    if (!reputation.totalTontines || reputation.totalTontines === 0) {
      return 500; // Score neutre pour nouveaux utilisateurs
    }

    // Score de base sur le taux de complétion
    const completionRate = reputation.completedTontines / reputation.totalTontines;
    const baseScore = completionRate * 700; // Max 700 points

    // Bonus pour fiabilité élevée
    const reliabilityBonus = Math.min(100, (reputation.reliabilityIndex || 0));

    // Bonus pour engagement à long terme
    const commitmentBonus = Math.min(100, (reputation.commitmentScore || 0));

    // Malus pour abandons
    const abandonmentRate = reputation.abandonedTontines / reputation.totalTontines;
    const abandonmentPenalty = Math.min(200, abandonmentRate * 400);

    const finalScore = Math.max(0, baseScore + reliabilityBonus + commitmentBonus - abandonmentPenalty);
    
    return finalScore;
  }

  /**
   * Calcule le score de contribution sociale (10% du score total)
   */
  private calculateSocialScore(reputation: IUserReputation): number {
    // Points pour invitations réussies
    const invitationPoints = Math.min(150, reputation.successfulInvitations * 15);

    // Points pour résolution de conflits
    const resolutionPoints = Math.min(200, reputation.resolvedDisputes * 40);

    // Points pour mentorat
    const mentorshipPoints = Math.min(100, reputation.mentorshipCount * 20);

    // Points pour endorsements reçus
    const endorsementPoints = Math.min(100, reputation.receivedEndorsements * 5);

    // Bonus pour ratio avis positifs/négatifs
    const totalReviews = reputation.positiveReviews + reputation.negativeReviews;
    const positivityBonus = totalReviews > 0 
      ? Math.min(50, (reputation.positiveReviews / totalReviews) * 50)
      : 0;

    const finalScore = invitationPoints + resolutionPoints + mentorshipPoints + endorsementPoints + positivityBonus;
    
    return finalScore;
  }

  /**
   * Calcule le score d'expérience (5% du score total)
   */
  private calculateExperienceScore(reputation: IUserReputation): number {
    // Points d'ancienneté
    const seniorityPoints = Math.min(150, reputation.membershipDuration * 0.3); // ~150 pts pour 500 jours

    // Points d'expérience niveau
    const levelPoints = Math.min(100, reputation.experienceLevel * 10);

    // Bonus pour nombre de tontines complétées
    const experiencePoints = Math.min(200, reputation.completedTontines * 15);

    // Bonus pour cycles complétés
    const cyclePoints = Math.min(100, reputation.completedCycles * 2);

    const finalScore = seniorityPoints + levelPoints + experiencePoints + cyclePoints;
    
    return finalScore;
  }

  /**
   * Calcule l'impact négatif des pénalités (-5% du score total)
   */
  private calculatePenaltyScore(reputation: IUserReputation): number {
    // Malus pour pénalités totales
    const totalPenaltyImpact = Math.min(300, reputation.totalPenalties * 15);

    // Malus supplémentaire pour pénalités actives
    const activePenaltyImpact = Math.min(200, reputation.activePenalties * 40);

    // Malus pour disputes causées
    const disputeImpact = Math.min(150, reputation.disputesCaused * 25);

    // Malus pour violations de règles
    const violationImpact = Math.min(200, reputation.ruleViolations * 35);

    const totalImpact = totalPenaltyImpact + activePenaltyImpact + disputeImpact + violationImpact;
    
    return -totalImpact; // Retourne un nombre négatif
  }

  // =====================================
  // ⚖️ APPLICATION DES POIDS
  // =====================================

  /**
   * Applique les poids aux scores de catégorie
   */
  private applyWeights(categoryScores: Record<string, number>, weights: ReputationWeight): number {
    return (
      categoryScores.payment * weights.paymentPunctuality +
      categoryScores.participation * weights.participationRate +
      categoryScores.completion * weights.completionRate +
      categoryScores.social * weights.socialContribution +
      categoryScores.experience * weights.experiencePoints +
      categoryScores.penalty * Math.abs(weights.penaltyImpact)
    );
  }

  // =====================================
  // 🔄 MULTIPLICATEURS D'ÉVÉNEMENTS
  // =====================================

  /**
   * Calcule le multiplicateur basé sur les événements récents
   */
  private calculateRecentEventsMultiplier(events: IReputationEvent[], reputation: IUserReputation): number {
    if (!events || events.length === 0) {
      return 1.0;
    }

    // Filtre les événements des 30 derniers jours
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(event => event.occurredAt >= thirtyDaysAgo);

    if (recentEvents.length === 0) {
      return 0.95; // Légère pénalité pour inactivité récente
    }

    // Analyse des tendances récentes
    const positiveEvents = recentEvents.filter(e => e.scoreImpact > 0);
    const negativeEvents = recentEvents.filter(e => e.scoreImpact < 0);

    let multiplier = 1.0;

    // Bonus pour activité positive récente
    if (positiveEvents.length > negativeEvents.length) {
      const ratio = positiveEvents.length / recentEvents.length;
      multiplier += Math.min(0.15, ratio * 0.2); // Max +15%
    }

    // Malus pour activité négative récente
    if (negativeEvents.length > positiveEvents.length) {
      const ratio = negativeEvents.length / recentEvents.length;
      multiplier -= Math.min(0.15, ratio * 0.2); // Max -15%
    }

    // Bonus pour consistance (nombreux événements positifs)
    if (positiveEvents.length >= 8 && negativeEvents.length <= 2) {
      multiplier += 0.10; // Bonus consistance +10%
    }

    // Malus pour volatilité élevée
    if (recentEvents.length >= 10) {
      const volatility = this.calculateEventVolatility(recentEvents);
      if (volatility > 0.7) {
        multiplier -= 0.05; // Malus volatilité -5%
      }
    }

    return Math.max(0.5, Math.min(1.5, multiplier));
  }

  /**
   * Calcule la volatilité des événements
   */
  private calculateEventVolatility(events: IReputationEvent[]): number {
    if (events.length < 2) return 0;

    const impacts = events.map(e => e.scoreImpact);
    const mean = impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length;
    const variance = impacts.reduce((sum, impact) => sum + Math.pow(impact - mean, 2), 0) / impacts.length;
    const standardDeviation = Math.sqrt(variance);

    // Normalise la volatilité entre 0 et 1
    return Math.min(1, standardDeviation / 50);
  }

  // =====================================
  // ⏰ DÉCROISSANCE TEMPORELLE
  // =====================================

  /**
   * Calcule la décroissance temporelle basée sur l'activité
   */
  private calculateTemporalDecay(lastActivity?: Date): number {
    if (!lastActivity) {
      return 0.3; // Forte pénalité pour utilisateurs jamais actifs
    }

    const daysSinceActivity = Math.floor(
      (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Courbe de décroissance progressive
    if (daysSinceActivity <= 7) return 1.0;      // Activité récente
    if (daysSinceActivity <= 14) return 0.98;    // -2%
    if (daysSinceActivity <= 30) return 0.95;    // -5%
    if (daysSinceActivity <= 60) return 0.90;    // -10%
    if (daysSinceActivity <= 90) return 0.85;    // -15%
    if (daysSinceActivity <= 180) return 0.75;   // -25%
    if (daysSinceActivity <= 365) return 0.60;   // -40%
    
    return 0.50; // Minimum 50% pour comptes très inactifs
  }

  // =====================================
  // 🏆 BONUS D'EXPÉRIENCE
  // =====================================

  /**
   * Calcule les bonus d'ancienneté et d'expérience
   */
  private calculateExperienceBonus(reputation: IUserReputation): number {
    let bonus = 0;

    // Bonus d'ancienneté
    if (reputation.membershipDuration >= 365) { // 1 an
      bonus += 50;
    }
    if (reputation.membershipDuration >= 730) { // 2 ans
      bonus += 50;
    }

    // Bonus pour grand nombre de tontines complétées
    if (reputation.completedTontines >= 10) {
      bonus += 30;
    }
    if (reputation.completedTontines >= 25) {
      bonus += 40;
    }

    // Bonus pour niveau élevé
    if (reputation.level === ReputationLevel.PLATINUM) {
      bonus += 25;
    }
    if (reputation.level === ReputationLevel.DIAMOND) {
      bonus += 50;
    }

    return bonus;
  }

  // =====================================
  // 🎯 CALCUL D'IMPACT D'ÉVÉNEMENT
  // =====================================

  /**
   * Calcule l'impact d'un événement spécifique
   */
  calculateEventImpact(
    eventType: ReputationEventType,
    severity: EventSeverity,
    contextualFactors: IContextualFactors,
    userReputation: IUserReputation
  ): { baseImpact: number; multipliers: IEventMultipliers; finalImpact: number } {
    
    // Impact de base
    const baseImpact = this.BASE_EVENT_IMPACTS[eventType] || 0;
    
    // Calcul des multiplicateurs
    const multipliers = this.calculateEventMultipliers(eventType, severity, contextualFactors, userReputation);
    
    // Impact final
    const finalImpact = Math.round(baseImpact * multipliers.final);
    
    this.logger.debug(`Event impact calculation: ${eventType} -> base: ${baseImpact}, final: ${finalImpact}`);
    
    return {
      baseImpact,
      multipliers,
      finalImpact
    };
  }

  /**
   * Calcule tous les multiplicateurs pour un événement
   */
  private calculateEventMultipliers(
    eventType: ReputationEventType,
    severity: EventSeverity,
    factors: IContextualFactors,
    reputation: IUserReputation
  ): IEventMultipliers {
    
    const multipliers: IEventMultipliers = {
      firstTime: 1.0,
      consecutive: 1.0,
      frequency: 1.0,
      recency: 1.0,
      severity: this.SEVERITY_MULTIPLIERS[severity] || 1.0,
      userLevel: this.getUserLevelMultiplier(factors.userReputationLevel),
      tontineHealth: this.getTontineHealthMultiplier(factors.tontineHealthScore),
      seasonal: 1.0,
      contextual: 1.0,
      final: 1.0
    };

    // Multiplicateur première fois (bonus/malus pour premiers événements)
    if (this.isFirstTimeEvent(eventType, reputation)) {
      multipliers.firstTime = eventType.includes('PAYMENT') ? 1.2 : 1.1;
    }

    // Multiplicateur niveau utilisateur
    multipliers.userLevel = this.getUserLevelMultiplier(factors.userReputationLevel);

    // Calcul du multiplicateur final
    multipliers.final = Object.entries(multipliers)
      .filter(([key]) => key !== 'final')
      .reduce((product, [_, value]) => product * value, 1.0);

    return multipliers;
  }

  /**
   * Vérifie si c'est la première fois pour ce type d'événement
   */
  private isFirstTimeEvent(eventType: ReputationEventType, reputation: IUserReputation): boolean {
    // Logique simplifiée - en production, consulter l'historique des événements
    if (eventType === ReputationEventType.PAYMENT_ON_TIME) {
      return reputation.totalPayments === 0;
    }
    if (eventType === ReputationEventType.TONTINE_COMPLETION) {
      return reputation.completedTontines === 0;
    }
    return false;
  }

  /**
   * Calcule le multiplicateur basé sur le niveau de l'utilisateur
   */
  private getUserLevelMultiplier(level: ReputationLevel): number {
    const multipliers = {
      [ReputationLevel.BRONZE]: 1.0,
      [ReputationLevel.SILVER]: 1.05,
      [ReputationLevel.GOLD]: 1.10,
      [ReputationLevel.PLATINUM]: 1.15,
      [ReputationLevel.DIAMOND]: 1.20
    };
    return multipliers[level] || 1.0;
  }

  /**
   * Calcule le multiplicateur basé sur la santé de la tontine
   */
  private getTontineHealthMultiplier(healthScore?: number): number {
    if (!healthScore) return 1.0;
    
    if (healthScore >= 90) return 1.10;
    if (healthScore >= 75) return 1.05;
    if (healthScore >= 50) return 1.0;
    if (healthScore >= 25) return 0.95;
    return 0.90;
  }

  // =====================================
  // 🏆 DÉTERMINATION DU NIVEAU
  // =====================================

  /**
   * Détermine le niveau de réputation basé sur le score
   */
  determineLevel(score: number): ReputationLevel {
    for (const [level, threshold] of Object.entries(REPUTATION_LEVEL_THRESHOLDS).reverse()) {
      if (score >= threshold) {
        return level as ReputationLevel;
      }
    }
    return ReputationLevel.BRONZE;
  }

  /**
   * Calcule les points nécessaires pour le niveau suivant
   */
  getPointsToNextLevel(currentScore: number): { points: number; nextLevel: ReputationLevel | null } {
    const currentLevel = this.determineLevel(currentScore);
    const levels = Object.values(ReputationLevel);
    const currentIndex = levels.indexOf(currentLevel);
    
    if (currentIndex === levels.length - 1) {
      return { points: 0, nextLevel: null }; // Déjà au niveau maximum
    }
    
    const nextLevel = levels[currentIndex + 1];
    const points = REPUTATION_LEVEL_THRESHOLDS[nextLevel] - currentScore;
    
    return { points, nextLevel };
  }

  // =====================================
  // 🎯 ÉVALUATION DES RISQUES
  // =====================================

  /**
   * Évalue le niveau de risque d'un utilisateur
   */
  assessRiskLevel(reputation: IUserReputation, recentEvents: IReputationEvent[]): RiskLevel {
    let riskScore = 0;

    // Facteurs de risque financier
    if (reputation.paymentPunctualityRate < 0.7) riskScore += 30;
    if (reputation.missedPayments > 3) riskScore += 20;
    if (reputation.activePenalties > 0) riskScore += 15;

    // Facteurs de risque comportemental
    if (reputation.disputesCaused > 2) riskScore += 25;
    if (reputation.completionRate < 0.5) riskScore += 20;
    if (reputation.ruleViolations > 1) riskScore += 30;

    // Facteurs de risque temporel
    const daysSinceActivity = reputation.lastActivity 
      ? Math.floor((Date.now() - reputation.lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    if (daysSinceActivity > 30) riskScore += 15;
    if (daysSinceActivity > 90) riskScore += 25;

    // Évaluation finale
    if (riskScore <= 10) return RiskLevel.VERY_LOW;
    if (riskScore <= 25) return RiskLevel.LOW;
    if (riskScore <= 50) return RiskLevel.MEDIUM;
    if (riskScore <= 75) return RiskLevel.HIGH;
    return RiskLevel.VERY_HIGH;
  }

  // =====================================
  // 📊 MÉTADONNÉES DE CALCUL
  // =====================================

  /**
   * Retourne les métadonnées de calcul pour audit
   */
  getCalculationMetadata(): Record<string, any> {
    return {
      algorithmVersion: this.ALGORITHM_VERSION,
      calculationDate: new Date(),
      defaultWeights: DEFAULT_REPUTATION_WEIGHTS,
      baseEventImpacts: Object.keys(this.BASE_EVENT_IMPACTS).length,
      features: [
        'multi-factor-weighting',
        'temporal-decay',
        'contextual-multipliers',
        'risk-assessment',
        'trend-analysis'
      ]
    };
  }
} 
