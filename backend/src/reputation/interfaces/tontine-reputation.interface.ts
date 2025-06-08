// backend/src/reputation/interfaces/tontine-reputation.interface.ts

import { 
  TrustLevel, 
  RiskLevel, 
  TrendData, 
  TrendDirection,
  ReputationLevel 
} from '../types/reputation-types';

/**
 * 🏛️ Interface Complète de Réputation des Tontines - Tontine Connect v0.6.0
 * 
 * Cette interface définit la réputation et les métriques de santé des tontines,
 * permettant d'évaluer la fiabilité et la performance de chaque groupe.
 */

// =====================================
// 🏛️ RÉPUTATION TONTINE PRINCIPALE
// =====================================

export interface ITontineReputation {
  // Identification
  tontineId: string;
  tontineName: string;
  creatorId: string;
  
  // Scores principaux
  healthScore: number;              // Score de santé global (0-100)
  trustLevel: TrustLevel;           // Niveau de confiance
  reputationScore: number;          // Score de réputation (0-1000, comme les utilisateurs)
  
  // =====================================
  // 📊 MÉTRIQUES DE PERFORMANCE
  // =====================================
  
  // Performance des cycles
  cycleCompletionRate: number;      // % de cycles complétés avec succès (0-100%)
  averageCycleDuration: number;     // Durée moyenne des cycles en jours
  cycleTimeliness: number;          // Ponctualité des cycles (0-100%)
  cycleConsistency: number;         // Consistance dans la durée des cycles (0-100%)
  
  // Performance des paiements
  paymentPunctualityRate: number;   // % de paiements à temps dans la tontine (0-100%)
  paymentCompletionRate: number;    // % de paiements effectués vs attendus (0-100%)
  averagePaymentDelay: number;      // Délai moyen des paiements en heures
  paymentVariability: number;       // Variabilité des paiements (0-100%, plus bas = mieux)
  
  // Performance des membres
  memberRetentionRate: number;      // % de membres qui restent jusqu'à la fin (0-100%)
  memberSatisfactionScore: number;  // Score de satisfaction des membres (0-100%)
  averageMemberScore: number;       // Score de réputation moyen des membres (0-1000)
  memberEngagementRate: number;     // Taux d'engagement des membres (0-100%)
  
  // =====================================
  // 💰 SANTÉ FINANCIÈRE
  // =====================================
  
  // Valeurs financières
  totalValue: number;               // Valeur totale de la tontine (FCFA)
  averageContribution: number;      // Contribution moyenne par membre (FCFA)
  totalContributions: number;       // Total des contributions reçues (FCFA)
  expectedContributions: number;    // Total des contributions attendues (FCFA)
  
  // Indicateurs financiers
  contributionComplianceRate: number; // % de conformité aux contributions (0-100%)
  financialStability: number;       // Stabilité financière (0-100%)
  cashflowPredictability: number;   // Prévisibilité des flux (0-100%)
  
  // Gestion des pénalités
  penaltyRate: number;              // % de paiements avec pénalités (0-100%)
  totalPenaltyAmount: number;       // Montant total des pénalités (FCFA)
  averagePenaltyAmount: number;     // Montant moyen des pénalités (FCFA)
  penaltyCollectionRate: number;    // % de pénalités effectivement collectées (0-100%)
  
  // Gestion des défauts
  defaultRate: number;              // % de paiements en défaut (0-100%)
  recoveryRate: number;             // % de récupération après défaut (0-100%)
  badDebtAmount: number;            // Montant des créances douteuses (FCFA)
  
  // =====================================
  // 🤝 DYNAMIQUES SOCIALES
  // =====================================
  
  // Communication et engagement
  communicationActivity: number;    // Messages par cycle en moyenne
  responseRate: number;             // Taux de réponse aux messages (0-100%)
  participationInDiscussions: number; // Participation aux discussions (0-100%)
  
  // Résolution de conflits
  disputeFrequency: number;         // Nombre de disputes par cycle
  disputeResolutionRate: number;    // % de disputes résolues (0-100%)
  averageResolutionTime: number;    // Temps moyen de résolution en heures
  conflictEscalationRate: number;   // % de conflits qui s'aggravent (0-100%)
  
  // Cohésion du groupe
  groupCohesionScore: number;       // Score de cohésion du groupe (0-100%)
  memberHelpfulness: number;        // Entraide entre membres (0-100%)
  leadershipEffectiveness: number;  // Efficacité du leadership (0-100%)
  decisionMakingSpeed: number;      // Rapidité de prise de décision (0-100%)
  
  // =====================================
  // 📈 DONNÉES DU CYCLE DE VIE
  // =====================================
  
  // Compteurs de cycles
  totalCycles: number;              // Nombre total de cycles planifiés
  completedCycles: number;          // Nombre de cycles complétés
  currentCycle: number;             // Cycle actuel
  failedCycles: number;             // Cycles échoués ou abandonnés
  
  // Composition des membres
  memberCount: number;              // Nombre actuel de membres
  originalMemberCount: number;      // Nombre de membres au début
  maxMemberCount: number;           // Nombre maximum de membres autorisés
  memberTurnover: number;           // Taux de rotation des membres (0-100%)
  
  // Statut et progression
  isActive: boolean;                // Tontine actuellement active
  completionPercentage: number;     // % de completion de la tontine (0-100%)
  estimatedCompletionDate?: Date;   // Date estimée de fin
  actualCompletionDate?: Date;      // Date réelle de fin
  
  // =====================================
  // 🎯 ÉVALUATION DES RISQUES
  // =====================================
  
  riskLevel: RiskLevel;             // Niveau de risque global
  riskFactors: ITontineRiskFactor[]; // Facteurs de risque détaillés
  overallRiskScore: number;         // Score de risque global (0-100%)
  
  // Risques spécifiques
  financialRisk: number;            // Risque financier (0-100%)
  operationalRisk: number;          // Risque opérationnel (0-100%)
  socialRisk: number;               // Risque social/conflits (0-100%)
  reputationalRisk: number;         // Risque réputationnel (0-100%)
  
  // Facteurs de protection
  protectiveFactors: string[];      // Facteurs qui réduisent les risques
  stabilityIndex: number;           // Indice de stabilité global (0-100%)
  resilience: number;               // Capacité de récupération (0-100%)
  
  // =====================================
  // 🏆 CLASSEMENTS ET COMPARAISONS
  // =====================================
  
  // Scores de recommandation
  recommendationScore: number;      // Score de recommandation global (0-100%)
  wouldRecommendPercentage: number; // % de membres qui recommanderaient (0-100%)
  netPromoterScore: number;         // Net Promoter Score (-100 à +100)
  
  // Classements
  categoryRanking?: ITontineRanking; // Classement dans sa catégorie
  globalRanking?: ITontineRanking;   // Classement global
  regionRanking?: ITontineRanking;   // Classement régional
  
  // Comparaisons avec les pairs
  performanceVsPeers: number;       // Performance vs tontines similaires (-100 à +100%)
  benchmarkScore: number;           // Score vs benchmark du secteur (0-100%)
  
  // =====================================
  // 📊 HISTORIQUE ET TENDANCES
  // =====================================
  
  // Historique de performance
  performanceHistory: ITontinePerformanceSnapshot[];
  
  // Tendances
  trends: {
    last30Days: TrendData[];        // Tendances sur 30 jours
    last90Days: TrendData[];        // Tendances sur 90 jours
    lastYear: TrendData[];          // Tendances sur l'année
    allTime: TrendData[];           // Tendances depuis la création
  };
  
  // Prédictions
  predictedHealthScore30d?: number; // Score de santé prédit dans 30 jours
  predictedCompletionRate?: number; // Taux de completion prédit
  trendDirection: TrendDirection;   // Direction générale des tendances
  
  // =====================================
  // 🔍 INSIGHTS ET ANALYTICS
  // =====================================
  
  // Points forts
  strengths: string[];              // Points forts identifiés
  opportunities: string[];          // Opportunités d'amélioration
  threats: string[];                // Menaces identifiées
  recommendations: string[];        // Recommandations d'amélioration
  
  // Analyses avancées
  seasonalityPattern?: string;      // Patterns saisonniers identifiés
  optimalCycleDuration?: number;    // Durée optimale de cycle recommandée
  optimalMemberCount?: number;      // Nombre optimal de membres recommandé
  
  // =====================================
  // ⏰ MÉTADONNÉES TEMPORELLES
  // =====================================
  
  // Dates importantes
  createdAt: Date;                  // Date de création de la tontine
  startedAt?: Date;                 // Date de début effectif
  lastEvaluation: Date;             // Dernière évaluation de réputation
  lastActivity: Date;               // Dernière activité dans la tontine
  
  // Durées
  totalDuration?: number;           // Durée totale en jours (si terminée)
  activeDuration: number;           // Durée d'activité en jours
  averageResponseTime: number;      // Temps de réponse moyen en heures
  
  // =====================================
  // 🔧 CONFIGURATION ET MÉTADONNÉES
  // =====================================
  
  // Configuration de l'évaluation
  evaluationMethod: string;         // Méthode d'évaluation utilisée
  lastCalculationVersion: string;   // Version de l'algorithme de calcul
  dataQualityScore: number;         // Qualité des données utilisées (0-100%)
  
  // Validation et audit
  isVerified: boolean;              // Données vérifiées
  verifiedBy?: string;              // ID du vérificateur
  verifiedAt?: Date;                // Date de vérification
  auditTrail: IAuditEntry[];        // Historique des modifications
  
  // Métadonnées techniques
  updatedAt: Date;                  // Dernière mise à jour
  version: number;                  // Version pour optimistic locking
}

// =====================================
// 🎯 INTERFACES SUPPLÉMENTAIRES
// =====================================

export interface ITontineRiskFactor {
  type: 'FINANCIAL' | 'OPERATIONAL' | 'SOCIAL' | 'REPUTATIONAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  impact: number;                   // Impact sur le score (0-100%)
  likelihood: number;               // Probabilité (0-100%)
  mitigationStrategies: string[];   // Stratégies d'atténuation
  detectedAt: Date;
  isActive: boolean;
}

export interface ITontineRanking {
  rank: number;                     // Position dans le classement
  totalCount: number;               // Nombre total d'éléments classés
  percentile: number;               // Percentile (0-100%)
  category: string;                 // Catégorie du classement
  lastUpdated: Date;
}

export interface ITontinePerformanceSnapshot {
  date: Date;
  cycle: number;
  healthScore: number;
  memberCount: number;
  completionRate: number;
  punctualityRate: number;
  financialHealth: number;
  socialCohesion: number;
  riskScore: number;
  
  // Événements significatifs
  significantEvents: string[];
  
  // Métadonnées
  dataSource: string;
  isEstimated: boolean;
}

export interface IAuditEntry {
  timestamp: Date;
  action: string;
  performedBy: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress?: string;
}

// =====================================
// 📊 MÉTRIQUES COMPARATIVES
// =====================================

export interface ITontineComparison {
  tontineId: string;
  comparedWith: 'PEERS' | 'CATEGORY' | 'REGION' | 'GLOBAL';
  
  // Comparaisons des scores
  healthScoreComparison: number;    // Différence vs moyenne (-100 à +100%)
  trustLevelComparison: number;     // Différence vs moyenne
  performanceComparison: number;    // Performance relative
  
  // Classements
  overallRank: number;
  categoryRank: number;
  improvementPotential: number;     // Potentiel d'amélioration (0-100%)
  
  // Benchmarks
  benchmarkData: {
    averageHealthScore: number;
    averageCompletionRate: number;
    averagePunctualityRate: number;
    averageMemberRetention: number;
  };
  
  lastComparisonDate: Date;
} 
