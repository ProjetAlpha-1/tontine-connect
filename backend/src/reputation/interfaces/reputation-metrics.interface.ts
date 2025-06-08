// backend/src/reputation/interfaces/reputation-metrics.interface.ts

import { 
  ReputationLevel, 
  TrendDirection, 
  RiskLevel,
  TrustLevel,
  BadgeType,
  TrendData,
  TrendPeriod
} from '../types/reputation-types';
import { IUserBadge } from '../interfaces/user-reputation.interface';

/**
 * 📊 Interface des Métriques et Analytics de Réputation - Tontine Connect v0.6.0
 * 
 * Cette interface définit toutes les métriques, analytics et insights 
 * pour le système de réputation des utilisateurs et des tontines.
 */

// =====================================
// 📊 MÉTRIQUES UTILISATEUR PRINCIPALES
// =====================================

export interface IReputationMetrics {
  userId: string;
  calculatedAt: Date;
  
  // ===== SCORES ACTUELS =====
  currentScore: number;                    // Score actuel (0-1000)
  currentLevel: ReputationLevel;           // Niveau actuel
  previousScore: number;                   // Score précédent
  previousLevel: ReputationLevel;          // Niveau précédent
  
  // ===== ÉVOLUTIONS TEMPORELLES =====
  scoreChange1h: number;                   // Changement dernière heure
  scoreChange24h: number;                  // Changement dernières 24h
  scoreChange7d: number;                   // Changement derniers 7 jours
  scoreChange30d: number;                  // Changement derniers 30 jours
  scoreChange90d: number;                  // Changement derniers 90 jours
  scoreChangeYTD: number;                  // Changement depuis début d'année
  
  // ===== PROGRESSION DE NIVEAU =====
  levelProgress: number;                   // Progression vers niveau suivant (0-100%)
  pointsToNextLevel: number;               // Points manquants pour niveau suivant
  nextLevel?: ReputationLevel;             // Niveau suivant à atteindre
  estimatedTimeToNextLevel?: number;       // Temps estimé en jours
  
  // ===== SCORES PAR CATÉGORIE =====
  categoryScores: {
    payment: ICategoryMetrics;             // Métriques de paiement
    participation: ICategoryMetrics;       // Métriques de participation
    completion: ICategoryMetrics;          // Métriques de complétion
    social: ICategoryMetrics;              // Métriques sociales
    experience: ICategoryMetrics;          // Métriques d'expérience
    penalty: ICategoryMetrics;             // Impact des pénalités
  };
  
  // ===== MÉTRIQUES COMPARATIVES =====
  percentileRank: number;                  // Percentile global (0-100%)
  rankInCategory: number;                  // Rang dans sa catégorie
  totalUsersInCategory: number;            // Total utilisateurs dans la catégorie
  
  // Comparaisons par segments
  rankAmongPeers: IPeerComparison;         // Comparaison avec pairs similaires
  rankByRegion: IRegionalComparison;       // Comparaison régionale
  rankByExperience: IExperienceComparison; // Comparaison par expérience
  
  // ===== ANALYSE DE TENDANCES =====
  trendDirection: TrendDirection;          // Direction générale
  trendStrength: number;                   // Force de la tendance (0-100%)
  volatility: number;                      // Volatilité du score (0-100%)
  stability: number;                       // Stabilité générale (0-100%)
  momentum: number;                        // Momentum actuel (-100 à +100)
  
  // Tendances par période
  trends: {
    daily: TrendData[];                    // Tendances quotidiennes (30 jours)
    weekly: TrendData[];                   // Tendances hebdomadaires (12 semaines)
    monthly: TrendData[];                  // Tendances mensuelles (12 mois)
    quarterly: TrendData[];                // Tendances trimestrielles (8 trimestres)
  };
  
  // ===== PRÉDICTIONS ET PROJECTIONS =====
  predictions: {
    score7d: IPrediction;                  // Prédiction 7 jours
    score30d: IPrediction;                 // Prédiction 30 jours
    score90d: IPrediction;                 // Prédiction 90 jours
    nextLevel: ILevelPrediction;           // Prédiction niveau suivant
    riskAssessment: IRiskPrediction;       // Évaluation des risques futurs
  };
  
  // ===== ACHIEVEMENTS ET BADGES =====
  achievementSummary: {
    totalBadges: number;                   // Nombre total de badges
    badgesByCategory: Record<string, number>; // Badges par catégorie
    recentBadges: IUserBadge[];            // Badges récents (30 jours)
    nextAvailableBadges: IAvailableBadge[]; // Badges atteignables
    badgeCompletion: number;               // % de badges obtenus vs disponibles
  };
  
  // ===== INSIGHTS ET RECOMMANDATIONS =====
  insights: {
    strengths: string[];                   // Points forts identifiés
    weaknesses: string[];                  // Points d'amélioration
    opportunities: string[];               // Opportunités détectées
    threats: string[];                     // Menaces identifiées
    quickWins: string[];                   // Améliorations rapides possibles
  };
  
  recommendations: {
    immediate: IRecommendation[];          // Actions immédiates
    shortTerm: IRecommendation[];          // Actions court terme (1-4 semaines)
    longTerm: IRecommendation[];           // Actions long terme (1-6 mois)
    personalized: IRecommendation[];       // Recommandations personnalisées
  };
  
  // ===== MÉTADONNÉES =====
  calculationMetadata: {
    version: string;                       // Version de l'algorithme
    dataQuality: number;                   // Qualité des données (0-100%)
    confidence: number;                    // Confiance dans les calculs (0-100%)
    lastDataUpdate: Date;                  // Dernière mise à jour des données
    processingTime: number;                // Temps de traitement en ms
  };
}

// =====================================
// 📈 MÉTRIQUES PAR CATÉGORIE
// =====================================

export interface ICategoryMetrics {
  currentScore: number;                    // Score actuel dans cette catégorie
  maxPossibleScore: number;                // Score maximum possible
  improvementPotential: number;            // Potentiel d'amélioration (0-100%)
  
  // Évolution
  change24h: number;                       // Changement 24h
  change7d: number;                        // Changement 7 jours
  change30d: number;                       // Changement 30 jours
  
  // Performance
  rank: number;                            // Rang dans cette catégorie
  percentile: number;                      // Percentile dans cette catégorie
  
  // Contribution au score global
  weightInTotal: number;                   // Poids dans le score total (%)
  contributionToTotal: number;             // Contribution effective au score total
  
  // Détails spécifiques
  submetrics: Record<string, number>;      // Sous-métriques détaillées
  keyFactors: string[];                    // Facteurs clés d'impact
  improvementActions: string[];            // Actions d'amélioration recommandées
}

// =====================================
// 🔍 COMPARAISONS DÉTAILLÉES
// =====================================

export interface IPeerComparison {
  peerGroup: string;                       // Définition du groupe de pairs
  userRank: number;                        // Rang de l'utilisateur
  totalPeers: number;                      // Nombre total de pairs
  percentile: number;                      // Percentile dans le groupe
  averageScore: number;                    // Score moyen du groupe
  scoreDifference: number;                 // Différence vs moyenne
  strengthsVsPeers: string[];              // Forces par rapport aux pairs
  weaknessesVsPeers: string[];             // Faiblesses par rapport aux pairs
}

export interface IRegionalComparison {
  region: string;                          // Région (ex: "Libreville", "Gabon")
  userRank: number;                        // Rang régional
  totalInRegion: number;                   // Total utilisateurs dans la région
  percentile: number;                      // Percentile régional
  regionalAverage: number;                 // Moyenne régionale
  nationalAverage: number;                 // Moyenne nationale
  regionalTrends: TrendData[];             // Tendances régionales
}

export interface IExperienceComparison {
  experienceGroup: string;                 // Groupe d'expérience (ex: "1-2 ans")
  userRank: number;                        // Rang dans le groupe d'expérience
  totalInGroup: number;                    // Total dans le groupe
  percentile: number;                      // Percentile dans le groupe
  averageForExperience: number;            // Moyenne pour ce niveau d'expérience
  expectedScore: number;                   // Score attendu pour ce niveau
  performanceVsExpected: number;           // Performance vs attendu (%)
}

// =====================================
// 🔮 PRÉDICTIONS ET PROJECTIONS
// =====================================

export interface IPrediction {
  predictedValue: number;                  // Valeur prédite
  confidence: number;                      // Confiance de la prédiction (0-100%)
  range: {                                 // Fourchette de prédiction
    min: number;                           // Valeur minimale probable
    max: number;                           // Valeur maximale probable
  };
  factors: string[];                       // Facteurs influençant la prédiction
  scenario: 'OPTIMISTIC' | 'REALISTIC' | 'PESSIMISTIC'; // Scénario
}

export interface ILevelPrediction {
  nextLevel: ReputationLevel;              // Niveau suivant prédit
  probability: number;                     // Probabilité d'atteindre (0-100%)
  estimatedDays: number;                   // Jours estimés pour atteindre
  requiredActions: string[];               // Actions requises
  risks: string[];                         // Risques qui pourraient empêcher
}

export interface IRiskPrediction {
  overallRisk: RiskLevel;                  // Niveau de risque global
  riskScore: number;                       // Score de risque (0-100%)
  
  specificRisks: {
    paymentDefault: number;                // Risque de défaut de paiement (0-100%)
    tontineAbandonment: number;            // Risque d'abandon de tontine (0-100%)
    reputationDecline: number;             // Risque de déclin de réputation (0-100%)
    socialConflict: number;                // Risque de conflit social (0-100%)
  };
  
  mitigationStrategies: string[];          // Stratégies d'atténuation
  earlyWarningSignals: string[];           // Signaux d'alerte précoce
}

// =====================================
// 🏅 BADGES ET ACCOMPLISSEMENTS
// =====================================

export interface IAvailableBadge {
  badgeType: BadgeType;                    // Type de badge
  name: string;                            // Nom du badge
  description: string;                     // Description
  
  // Progression vers le badge
  currentProgress: number;                 // Progression actuelle
  requiredProgress: number;                // Progression requise
  progressPercentage: number;              // Pourcentage de completion
  
  // Estimation
  estimatedDaysToEarn: number;             // Jours estimés pour l'obtenir
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'; // Difficulté
  
  // Actions requises
  requiredActions: string[];               // Actions à effectuer
  tips: string[];                          // Conseils pour l'obtenir
}

// =====================================
// 💡 RECOMMANDATIONS
// =====================================

export interface IRecommendation {
  id: string;                              // ID unique de la recommandation
  title: string;                           // Titre court
  description: string;                     // Description détaillée
  category: 'PAYMENT' | 'PARTICIPATION' | 'SOCIAL' | 'EXPERIENCE' | 'GENERAL';
  
  // Impact
  expectedImpact: number;                  // Impact attendu sur le score
  effort: 'LOW' | 'MEDIUM' | 'HIGH';       // Effort requis
  timeline: string;                        // Délai d'implémentation
  
  // Détails
  steps: string[];                         // Étapes à suivre
  resources: string[];                     // Ressources nécessaires
  successMetrics: string[];                // Métriques de succès
  
  // Contexte
  relevanceScore: number;                  // Pertinence pour l'utilisateur (0-100%)
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags: string[];                          // Tags pour filtrage
}

// =====================================
// 📊 MÉTRIQUES GLOBALES SYSTÈME
// =====================================

export interface ISystemMetrics {
  timestamp: Date;                         // Timestamp des métriques
  
  // Statistiques globales
  totalUsers: number;                      // Nombre total d'utilisateurs
  activeUsers: number;                     // Utilisateurs actifs (30 jours)
  totalTontines: number;                   // Nombre total de tontines
  activeTontines: number;                  // Tontines actives
  
  // Distribution des scores
  scoreDistribution: {
    bronze: number;                        // % utilisateurs Bronze
    silver: number;                        // % utilisateurs Silver
    gold: number;                          // % utilisateurs Gold
    platinum: number;                      // % utilisateurs Platinum
    diamond: number;                       // % utilisateurs Diamond
  };
  
  // Moyennes du système
  averageScore: number;                    // Score moyen global
  medianScore: number;                     // Score médian
  averageByLevel: Record<ReputationLevel, number>; // Score moyen par niveau
  
  // Tendances du système
  systemTrends: {
    averageScoreChange30d: number;         // Évolution moyenne des scores
    newUsersGrowth: number;                // Croissance nouveaux utilisateurs
    engagementTrend: TrendDirection;       // Tendance d'engagement
    qualityTrend: TrendDirection;          // Tendance de qualité
  };
  
  // Santé du système
  systemHealth: {
    dataQuality: number;                   // Qualité globale des données (0-100%)
    algorithmPerformance: number;          // Performance algorithmes (0-100%)
    userSatisfaction: number;              // Satisfaction utilisateurs (0-100%)
    systemStability: number;               // Stabilité du système (0-100%)
  };
}

// =====================================
// 📈 ANALYTICS AVANCÉES
// =====================================

export interface IAdvancedAnalytics {
  userId: string;
  analysisDate: Date;
  
  // Analyse comportementale
  behaviorProfile: {
    paymentPattern: 'EARLY' | 'ON_TIME' | 'LATE' | 'INCONSISTENT';
    participationPattern: 'HIGHLY_ENGAGED' | 'REGULAR' | 'SPORADIC' | 'MINIMAL';
    socialBehavior: 'LEADER' | 'COLLABORATOR' | 'FOLLOWER' | 'INDEPENDENT';
    riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  };
  
  // Segmentation
  userSegment: {
    primary: string;                       // Segment principal
    secondary: string[];                   // Segments secondaires
    characteristics: string[];             // Caractéristiques du segment
    typicalBehaviors: string[];            // Comportements typiques
  };
  
  // Analyse de réseau social
  networkMetrics: {
    connections: number;                   // Nombre de connexions
    influence: number;                     // Score d'influence (0-100%)
    centrality: number;                    // Centralité dans le réseau (0-100%)
    clusterCoefficient: number;            // Coefficient de clustering
  };
  
  // Machine Learning insights
  mlInsights: {
    churnProbability: number;              // Probabilité d'abandon (0-100%)
    lifetimeValue: number;                 // Valeur vie client estimée
    nextBestAction: string;                // Prochaine meilleure action
    personalityTraits: string[];           // Traits de personnalité détectés
  };
}

// =====================================
// 🎯 MÉTRIQUES DE PERFORMANCE
// =====================================

export interface IPerformanceMetrics {
  calculationId: string;
  startTime: Date;
  endTime: Date;
  
  // Performance de calcul
  calculationTime: number;                 // Temps de calcul en ms
  dataProcessed: number;                   // Quantité de données traitées
  cacheHitRate: number;                    // Taux de succès du cache (0-100%)
  
  // Qualité des résultats
  accuracy: number;                        // Précision des calculs (0-100%)
  completeness: number;                    // Complétude des données (0-100%)
  consistency: number;                     // Consistance des résultats (0-100%)
  
  // Utilisation des ressources
  memoryUsage: number;                     // Utilisation mémoire en MB
  cpuUsage: number;                        // Utilisation CPU (0-100%)
  databaseQueries: number;                 // Nombre de requêtes DB
  
  // Erreurs et avertissements
  errors: string[];                        // Erreurs rencontrées
  warnings: string[];                      // Avertissements
  dataQualityIssues: string[];             // Problèmes de qualité des données
}
