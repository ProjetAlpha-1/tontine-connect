// backend/src/reputation/algorithms/tontine-scoring.ts

import { Injectable, Logger } from '@nestjs/common';
import { 
  TrustLevel, 
  RiskLevel, 
  TrendDirection 
} from '../types/reputation-types';
import { 
  ITontineReputation,
  ITontineRiskFactor,
  ITontinePerformanceSnapshot 
} from '../interfaces/tontine-reputation.interface';
import { IUserReputation } from '../interfaces/user-reputation.interface';

/**
 * 🏛️ Système de Notation des Tontines - Tontine Connect v0.6.0
 * 
 * Algorithme sophistiqué qui évalue la santé, fiabilité et performance des tontines.
 * Différenciateur majeur qui permet aux utilisateurs de choisir les meilleures tontines.
 */

@Injectable()
export class TontineScoring {
  private readonly logger = new Logger(TontineScoring.name);
  
  // =====================================
  // 🎯 CONFIGURATION DES ALGORITHMES
  // =====================================
  
  private readonly SCORING_VERSION = '1.0.0';
  
  // Poids pour le calcul du score de santé global
  private readonly HEALTH_WEIGHTS = {
    financialHealth: 0.30,        // 30% - Santé financière
    operationalEfficiency: 0.25,  // 25% - Efficacité opérationnelle
    memberSatisfaction: 0.20,     // 20% - Satisfaction des membres
    socialCohesion: 0.15,         // 15% - Cohésion sociale
    riskManagement: 0.10          // 10% - Gestion des risques
  };

  // Seuils pour les niveaux de confiance
  private readonly TRUST_LEVEL_THRESHOLDS = {
    [TrustLevel.VERY_HIGH]: 85,   // 85-100%
    [TrustLevel.HIGH]: 70,        // 70-84%
    [TrustLevel.MEDIUM]: 50,      // 50-69%
    [TrustLevel.LOW]: 30,         // 30-49%
    [TrustLevel.VERY_LOW]: 0      // 0-29%
  };

  // =====================================
  // 🏆 CALCUL DU SCORE DE SANTÉ PRINCIPAL
  // =====================================

  /**
   * Calcule le score de santé global d'une tontine
   */
  async calculateTontineHealthScore(
    tontineData: Partial<ITontineReputation>,
    memberProfiles: IUserReputation[],
    performanceHistory: ITontinePerformanceSnapshot[]
  ): Promise<number> {
    try {
      this.logger.debug(`Calculating health score for tontine ${tontineData.tontineId}`);
      
      // 1. Calcul des scores par dimension
      const financialHealth = this.calculateFinancialHealth(tontineData);
      const operationalEfficiency = this.calculateOperationalEfficiency(tontineData, performanceHistory);
      const memberSatisfaction = this.calculateMemberSatisfaction(tontineData, memberProfiles);
      const socialCohesion = this.calculateSocialCohesion(tontineData);
      const riskManagement = this.calculateRiskManagement(tontineData);
      
      // 2. Application des poids
      const weightedScore = 
        financialHealth * this.HEALTH_WEIGHTS.financialHealth +
        operationalEfficiency * this.HEALTH_WEIGHTS.operationalEfficiency +
        memberSatisfaction * this.HEALTH_WEIGHTS.memberSatisfaction +
        socialCohesion * this.HEALTH_WEIGHTS.socialCohesion +
        riskManagement * this.HEALTH_WEIGHTS.riskManagement;
      
      // 3. Ajustements contextuels
      const maturityBonus = this.calculateMaturityBonus(tontineData);
      const stabilityBonus = this.calculateStabilityBonus(performanceHistory);
      
      // 4. Score final
      const finalScore = Math.max(0, Math.min(100, 
        Math.round(weightedScore + maturityBonus + stabilityBonus)
      ));
      
      this.logger.debug(`Health score result: ${finalScore} (financial: ${financialHealth}, operational: ${operationalEfficiency}, satisfaction: ${memberSatisfaction}, social: ${socialCohesion}, risk: ${riskManagement})`);
      
      return finalScore;
      
    } catch (error) {
      this.logger.error(`Error calculating tontine health score: ${error.message}`, error.stack);
      return 50; // Score neutre en cas d'erreur
    }
  }

  // =====================================
  // 💰 SANTÉ FINANCIÈRE (30%)
  // =====================================

  /**
   * Évalue la santé financière de la tontine
   */
  private calculateFinancialHealth(tontine: Partial<ITontineReputation>): number {
    let score = 0;
    
    // Score de conformité aux contributions (40% de la santé financière)
    const contributionCompliance = tontine.contributionComplianceRate || 0;
    score += contributionCompliance * 0.4;
    
    // Score de stabilité financière (25%)
    const financialStability = tontine.financialStability || 0;
    score += financialStability * 0.25;
    
    // Score de prévisibilité des flux (20%)
    const cashflowPredictability = tontine.cashflowPredictability || 0;
    score += cashflowPredictability * 0.20;
    
    // Impact des pénalités (10% - malus)
    const penaltyImpact = Math.min(10, (tontine.penaltyRate || 0) / 2);
    score -= penaltyImpact;
    
    // Impact des défauts (5% - malus)
    const defaultImpact = Math.min(5, (tontine.defaultRate || 0) / 2);
    score -= defaultImpact;
    
    return Math.max(0, Math.min(100, score));
  }

  // =====================================
  // ⚙️ EFFICACITÉ OPÉRATIONNELLE (25%)
  // =====================================

  /**
   * Évalue l'efficacité opérationnelle de la tontine
   */
  private calculateOperationalEfficiency(
    tontine: Partial<ITontineReputation>, 
    history: ITontinePerformanceSnapshot[]
  ): number {
    let score = 0;
    
    // Taux de complétion des cycles (35%)
    const cycleCompletion = tontine.cycleCompletionRate || 0;
    score += cycleCompletion * 0.35;
    
    // Ponctualité des paiements (30%)
    const paymentPunctuality = tontine.paymentPunctualityRate || 0;
    score += paymentPunctuality * 0.30;
    
    // Consistance des cycles (20%)
    const cycleConsistency = this.calculateCycleConsistency(tontine, history);
    score += cycleConsistency * 0.20;
    
    // Efficacité de la prise de décision (15%)
    const decisionEfficiency = tontine.decisionMakingSpeed || 0;
    score += decisionEfficiency * 0.15;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calcule la consistance des cycles
   */
  private calculateCycleConsistency(
    tontine: Partial<ITontineReputation>,
    history: ITontinePerformanceSnapshot[]
  ): number {
    if (!history || history.length < 2) {
      return tontine.cycleConsistency || 50; // Score neutre si pas d'historique
    }
    
    // Calcule la variance des durées de cycle
    const durations = history
      .map(h => h.date)
      .slice(1)
      .map((date, i) => {
        const prevDate = history[i].date;
        return Math.abs(date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      });
    
    if (durations.length === 0) return 50;
    
    const meanDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - meanDuration, 2), 0) / durations.length;
    const coefficient = Math.sqrt(variance) / meanDuration;
    
    // Plus le coefficient de variation est faible, plus la consistance est élevée
    return Math.max(0, Math.min(100, 100 - (coefficient * 100)));
  }

  // =====================================
  // 😊 SATISFACTION DES MEMBRES (20%)
  // =====================================

  /**
   * Évalue la satisfaction des membres
   */
  private calculateMemberSatisfaction(
    tontine: Partial<ITontineReputation>,
    members: IUserReputation[]
  ): number {
    let score = 0;
    
    // Score de satisfaction direct (40%)
    const directSatisfaction = tontine.memberSatisfactionScore || 0;
    score += directSatisfaction * 0.40;
    
    // Taux de rétention des membres (35%)
    const retentionRate = tontine.memberRetentionRate || 0;
    score += retentionRate * 0.35;
    
    // Score de recommandation (Net Promoter Score) (25%)
    const npsScore = this.normalizeNPS(tontine.netPromoterScore || 0);
    score += npsScore * 0.25;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Normalise le Net Promoter Score (-100 à +100) vers 0-100
   */
  private normalizeNPS(nps: number): number {
    return (nps + 100) / 2;
  }

  // =====================================
  // 🤝 COHÉSION SOCIALE (15%)
  // =====================================

  /**
   * Évalue la cohésion sociale du groupe
   */
  private calculateSocialCohesion(tontine: Partial<ITontineReputation>): number {
    let score = 0;
    
    // Score de cohésion du groupe (30%)
    const groupCohesion = tontine.groupCohesionScore || 0;
    score += groupCohesion * 0.30;
    
    // Activité de communication (25%)
    const commActivity = this.normalizeCommunicationActivity(tontine.communicationActivity || 0);
    score += commActivity * 0.25;
    
    // Taux de résolution des disputes (25%)
    const disputeResolution = tontine.disputeResolutionRate || 0;
    score += disputeResolution * 0.25;
    
    // Entraide entre membres (20%)
    const memberHelpfulness = tontine.memberHelpfulness || 0;
    score += memberHelpfulness * 0.20;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Normalise l'activité de communication
   */
  private normalizeCommunicationActivity(messagesPerCycle: number): number {
    // Considère 50 messages par cycle comme optimal (100%)
    // Plus de 100 messages pourrait indiquer des problèmes
    if (messagesPerCycle <= 50) {
      return Math.min(100, (messagesPerCycle / 50) * 100);
    } else {
      // Décroissance après 50 messages
      return Math.max(50, 100 - ((messagesPerCycle - 50) * 0.5));
    }
  }

  // =====================================
  // 🛡️ GESTION DES RISQUES (10%)
  // =====================================

  /**
   * Évalue la gestion des risques
   */
  private calculateRiskManagement(tontine: Partial<ITontineReputation>): number {
    let score = 100; // Commence à 100 et déduit les risques
    
    // Impact du niveau de risque global
    const overallRisk = tontine.overallRiskScore || 0;
    score -= overallRisk * 0.5; // Déduit jusqu'à 50 points
    
    // Impact de la fréquence des disputes
    const disputeFrequency = tontine.disputeFrequency || 0;
    if (disputeFrequency > 1) {
      score -= Math.min(20, (disputeFrequency - 1) * 10);
    }
    
    // Bonus pour l'indice de stabilité
    const stabilityBonus = (tontine.stabilityIndex || 0) * 0.3;
    score += stabilityBonus;
    
    // Bonus pour la résilience
    const resilienceBonus = (tontine.resilience || 0) * 0.2;
    score += resilienceBonus;
    
    return Math.max(0, Math.min(100, score));
  }

  // =====================================
  // 🏆 BONUS ET AJUSTEMENTS
  // =====================================

  /**
   * Calcule le bonus de maturité
   */
  private calculateMaturityBonus(tontine: Partial<ITontineReputation>): number {
    const completedCycles = tontine.completedCycles || 0;
    
    // Bonus progressif pour les tontines matures
    if (completedCycles >= 10) return 5;      // +5 points pour 10+ cycles
    if (completedCycles >= 5) return 3;       // +3 points pour 5+ cycles
    if (completedCycles >= 3) return 1;       // +1 point pour 3+ cycles
    
    return 0;
  }

  /**
   * Calcule le bonus de stabilité basé sur l'historique
   */
  private calculateStabilityBonus(history: ITontinePerformanceSnapshot[]): number {
    if (!history || history.length < 3) return 0;
    
    // Analyse la stabilité des scores de santé
    const healthScores = history.slice(-6).map(h => h.healthScore); // 6 derniers snapshots
    const variance = this.calculateVariance(healthScores);
    
    // Bonus inversement proportionnel à la variance
    if (variance < 5) return 3;     // Très stable
    if (variance < 10) return 2;    // Stable
    if (variance < 20) return 1;    // Moyennement stable
    
    return 0;
  }

  /**
   * Calcule la variance d'un tableau de nombres
   */
  private calculateVariance(numbers: number[]): number {
    if (numbers.length < 2) return 0;
    
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
    
    return variance;
  }

  // =====================================
  // 🎯 DÉTERMINATION DU NIVEAU DE CONFIANCE
  // =====================================

  /**
   * Détermine le niveau de confiance basé sur le score de santé
   */
  determineTrustLevel(healthScore: number): TrustLevel {
    for (const [level, threshold] of Object.entries(this.TRUST_LEVEL_THRESHOLDS)) {
      if (healthScore >= threshold) {
        return level as TrustLevel;
      }
    }
    return TrustLevel.VERY_LOW;
  }

  // =====================================
  // 📊 ANALYSE DES RISQUES
  // =====================================

  /**
   * Identifie et évalue les facteurs de risque d'une tontine
   */
  assessTontineRisks(tontine: Partial<ITontineReputation>): ITontineRiskFactor[] {
    const risks: ITontineRiskFactor[] = [];
    
    // Risques financiers
    if ((tontine.defaultRate || 0) > 10) {
      risks.push({
        type: 'FINANCIAL',
        severity: (tontine.defaultRate || 0) > 20 ? 'CRITICAL' : 'HIGH',
        description: `Taux de défaut élevé: ${tontine.defaultRate}%`,
        impact: Math.min(100, (tontine.defaultRate || 0) * 2),
        likelihood: 80,
        mitigationStrategies: [
          'Renforcer les critères de sélection des membres',
          'Mettre en place un système de garanties',
          'Améliorer le suivi des paiements'
        ],
        detectedAt: new Date(),
        isActive: true
      });
    }
    
    // Risques opérationnels
    if ((tontine.cycleCompletionRate || 0) < 70) {
      risks.push({
        type: 'OPERATIONAL',
        severity: (tontine.cycleCompletionRate || 0) < 50 ? 'CRITICAL' : 'HIGH',
        description: `Faible taux de complétion des cycles: ${tontine.cycleCompletionRate}%`,
        impact: 100 - (tontine.cycleCompletionRate || 0),
        likelihood: 75,
        mitigationStrategies: [
          'Améliorer la planification des cycles',
          'Renforcer la communication',
          'Simplifier les processus'
        ],
        detectedAt: new Date(),
        isActive: true
      });
    }
    
    // Risques sociaux
    if ((tontine.disputeFrequency || 0) > 2) {
      risks.push({
        type: 'SOCIAL',
        severity: (tontine.disputeFrequency || 0) > 5 ? 'CRITICAL' : 'MEDIUM',
        description: `Fréquence élevée de disputes: ${tontine.disputeFrequency} par cycle`,
        impact: Math.min(100, (tontine.disputeFrequency || 0) * 15),
        likelihood: 70,
        mitigationStrategies: [
          'Former les leaders à la médiation',
          'Clarifier les règles du groupe',
          'Mettre en place des mécanismes de résolution rapide'
        ],
        detectedAt: new Date(),
        isActive: true
      });
    }
    
    // Risques de réputation
    if ((tontine.memberRetentionRate || 0) < 60) {
      risks.push({
        type: 'REPUTATIONAL',
        severity: (tontine.memberRetentionRate || 0) < 40 ? 'HIGH' : 'MEDIUM',
        description: `Faible rétention des membres: ${tontine.memberRetentionRate}%`,
        impact: 100 - (tontine.memberRetentionRate || 0),
        likelihood: 65,
        mitigationStrategies: [
          'Améliorer l\'expérience membre',
          'Renforcer la communication',
          'Offrir plus de flexibilité'
        ],
        detectedAt: new Date(),
        isActive: true
      });
    }
    
    return risks;
  }

  // =====================================
  // 📈 CALCUL DU SCORE DE RÉPUTATION
  // =====================================

  /**
   * Convertit le score de santé (0-100) en score de réputation (0-1000)
   */
  convertHealthToReputationScore(healthScore: number): number {
    // Conversion non-linéaire pour récompenser l'excellence
    const normalized = healthScore / 100;
    const exponential = Math.pow(normalized, 0.8); // Courbe légèrement exponentielle
    
    return Math.round(exponential * 1000);
  }

  // =====================================
  // 🏆 CLASSEMENTS ET COMPARAISONS
  // =====================================

  /**
   * Compare une tontine avec ses pairs
   */
  async compareTontineWithPeers(
    tontine: ITontineReputation,
    peerTontines: ITontineReputation[]
  ): Promise<{
    rank: number;
    percentile: number;
    performanceVsPeers: number;
    strengths: string[];
    weaknesses: string[];
  }> {
    
    // Classement par score de santé
    const sortedPeers = [...peerTontines, tontine]
      .sort((a, b) => b.healthScore - a.healthScore);
    
    const rank = sortedPeers.findIndex(t => t.tontineId === tontine.tontineId) + 1;
    const percentile = Math.round(((sortedPeers.length - rank) / sortedPeers.length) * 100);
    
    // Performance vs moyenne des pairs
    const avgPeerScore = peerTontines.reduce((sum, t) => sum + t.healthScore, 0) / peerTontines.length;
    const performanceVsPeers = Math.round(((tontine.healthScore - avgPeerScore) / avgPeerScore) * 100);
    
    // Identification des forces et faiblesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    const avgMetrics = this.calculateAverageMetrics(peerTontines);
    
    if (tontine.paymentPunctualityRate > avgMetrics.paymentPunctuality + 10) {
      strengths.push('Excellente ponctualité des paiements');
    }
    if (tontine.memberRetentionRate > avgMetrics.memberRetention + 15) {
      strengths.push('Très bonne rétention des membres');
    }
    if (tontine.disputeFrequency < avgMetrics.disputeFrequency - 1) {
      strengths.push('Faible fréquence de disputes');
    }
    
    if (tontine.paymentPunctualityRate < avgMetrics.paymentPunctuality - 10) {
      weaknesses.push('Ponctualité des paiements à améliorer');
    }
    if (tontine.memberRetentionRate < avgMetrics.memberRetention - 15) {
      weaknesses.push('Rétention des membres insuffisante');
    }
    if (tontine.disputeFrequency > avgMetrics.disputeFrequency + 1) {
      weaknesses.push('Fréquence élevée de disputes');
    }
    
    return {
      rank,
      percentile,
      performanceVsPeers,
      strengths,
      weaknesses
    };
  }

  /**
   * Calcule les métriques moyennes d'un ensemble de tontines
   */
  private calculateAverageMetrics(tontines: ITontineReputation[]): {
    paymentPunctuality: number;
    memberRetention: number;
    disputeFrequency: number;
    healthScore: number;
  } {
    if (tontines.length === 0) {
      return {
        paymentPunctuality: 0,
        memberRetention: 0,
        disputeFrequency: 0,
        healthScore: 0
      };
    }
    
    return {
      paymentPunctuality: tontines.reduce((sum, t) => sum + t.paymentPunctualityRate, 0) / tontines.length,
      memberRetention: tontines.reduce((sum, t) => sum + t.memberRetentionRate, 0) / tontines.length,
      disputeFrequency: tontines.reduce((sum, t) => sum + t.disputeFrequency, 0) / tontines.length,
      healthScore: tontines.reduce((sum, t) => sum + t.healthScore, 0) / tontines.length
    };
  }

  // =====================================
  // 📊 RECOMMANDATIONS D'AMÉLIORATION
  // =====================================

  /**
   * Génère des recommandations d'amélioration pour une tontine
   */
  generateImprovementRecommendations(tontine: ITontineReputation): string[] {
    const recommendations: string[] = [];
    
    // Recommandations financières
    if (tontine.contributionComplianceRate < 90) {
      recommendations.push('Améliorer le suivi et les rappels de paiement');
    }
    if (tontine.penaltyRate > 10) {
      recommendations.push('Réviser la politique de pénalités pour plus de flexibilité');
    }
    
    // Recommandations opérationnelles
    if (tontine.cycleCompletionRate < 85) {
      recommendations.push('Optimiser la planification et le suivi des cycles');
    }
    if (tontine.decisionMakingSpeed < 70) {
      recommendations.push('Mettre en place des processus de décision plus efficaces');
    }
    
    // Recommandations sociales
    if (tontine.memberSatisfactionScore < 75) {
      recommendations.push('Organiser des activités pour renforcer la cohésion du groupe');
    }
    if (tontine.disputeFrequency > 1) {
      recommendations.push('Former les leaders à la médiation et à la résolution de conflits');
    }
    
    // Recommandations de communication
    if (tontine.communicationActivity < 20) {
      recommendations.push('Encourager plus de communication entre les membres');
    }
    if (tontine.responseRate < 80) {
      recommendations.push('Améliorer la réactivité aux messages du groupe');
    }
    
    return recommendations;
  }

  // =====================================
  // 🔧 MÉTADONNÉES DE CALCUL
  // =====================================

  /**
   * Retourne les métadonnées de calcul pour audit
   */
  getScoringMetadata(): Record<string, any> {
    return {
      scoringVersion: this.SCORING_VERSION,
      calculationDate: new Date(),
      healthWeights: this.HEALTH_WEIGHTS,
      trustLevelThresholds: this.TRUST_LEVEL_THRESHOLDS,
      features: [
        'multi-dimensional-health-scoring',
        'risk-factor-identification',
        'peer-comparison',
        'improvement-recommendations',
        'trust-level-classification'
      ]
    };
  }
} 
