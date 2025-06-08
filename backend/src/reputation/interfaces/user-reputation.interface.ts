// backend/src/reputation/interfaces/user-reputation.interface.ts

import { 
  ReputationLevel, 
  BadgeType, 
  RiskLevel, 
  TrendData, 
  TrendDirection 
} from '../types/reputation-types';

/**
 * 👤 Interface Complète de Réputation Utilisateur - Tontine Connect v0.6.0
 * 
 * Cette interface définit tous les aspects de la réputation d'un utilisateur,
 * incluant les métriques, l'historique, les badges et les prédictions.
 */

// =====================================
// 👤 RÉPUTATION UTILISATEUR PRINCIPALE
// =====================================

export interface IUserReputation {
  // Identification
  userId: string;
  userPhone?: string;           // Pour référence rapide
  userName?: string;            // Pour affichage
  
  // Score et niveau actuels
  score: number;                // Score principal (0-1000)
  level: ReputationLevel;       // Niveau actuel
  previousLevel?: ReputationLevel; // Niveau précédent (pour détecter les changements)
  
  // =====================================
  // 📊 MÉTRIQUES PRINCIPALES
  // =====================================
  
  // Performance des paiements (35% du score)
  paymentPunctualityRate: number;    // Pourcentage de paiements à temps (0-100%)
  averagePaymentDelay: number;       // Délai moyen en heures (négatif = en avance)
  paymentConsistency: number;        // Consistance des paiements (0-100%)
  
  // Participation (25% du score)
  participationRate: number;         // Taux de participation active (0-100%)
  attendanceRate: number;           // Taux de présence aux événements (0-100%)
  engagementScore: number;          // Score d'engagement social (0-100%)
  
  // Complétion (20% du score)
  completionRate: number;           // Taux de complétion des tontines (0-100%)
  reliabilityIndex: number;         // Indice de fiabilité (0-100%)
  commitmentScore: number;          // Score d'engagement à long terme (0-100%)
  
  // =====================================
  // 📈 DONNÉES D'EXPÉRIENCE
  // =====================================
  
  // Compteurs de tontines
  totalTontines: number;            // Nombre total de tontines rejointes
  completedTontines: number;        // Nombre de tontines complétées
  activeTontines: number;           // Nombre de tontines actuellement actives
  abandonedTontines: number;        // Nombre de tontines abandonnées
  
  // Compteurs de paiements
  totalPayments: number;            // Nombre total de paiements effectués
  onTimePayments: number;           // Paiements effectués à temps
  earlyPayments: number;            // Paiements effectués en avance
  latePayments: number;             // Paiements effectués en retard
  missedPayments: number;           // Paiements complètement manqués
  
  // Compteurs de cycles
  totalCycles: number;              // Nombre total de cycles participés
  completedCycles: number;          // Cycles complétés avec succès
  currentCycles: number;            // Cycles actuellement actifs
  
  // =====================================
  // 🤝 MÉTRIQUES SOCIALES
  // =====================================
  
  // Contribution à la communauté
  invitedMembers: number;           // Membres invités par cet utilisateur
  successfulInvitations: number;    // Invitations qui ont abouti
  mentorshipCount: number;          // Nombre de personnes mentorées
  
  // Résolution de conflits
  resolvedDisputes: number;         // Conflits résolus avec succès
  mediationCount: number;           // Nombre de médiations effectuées
  conflictResolutionRate: number;   // Taux de succès en résolution (0-100%)
  
  // Feedback et endorsements
  receivedEndorsements: number;     // Endorsements reçus d'autres membres
  givenEndorsements: number;        // Endorsements donnés à d'autres
  positiveReviews: number;          // Avis positifs reçus
  neutralReviews: number;           // Avis neutres reçus
  negativeReviews: number;          // Avis négatifs reçus
  
  // =====================================
  // ⚠️ PÉNALITÉS ET PROBLÈMES
  // =====================================
  
  // Pénalités
  totalPenalties: number;           // Nombre total de pénalités reçues
  activePenalties: number;          // Pénalités actuellement actives
  penaltyAmount: number;            // Montant total des pénalités (FCFA)
  averagePenaltyAmount: number;     // Montant moyen par pénalité
  
  // Disputes et conflits
  disputesCaused: number;           // Nombre de conflits causés
  disputesInvolved: number;         // Nombre de conflits impliqués
  activeDisputes: number;           // Conflits actuellement actifs
  
  // Infractions
  ruleViolations: number;           // Violations de règles
  warningsReceived: number;         // Avertissements reçus
  suspensionsCount: number;         // Nombre de suspensions
  
  // =====================================
  // 🏅 BADGES ET ACCOMPLISSEMENTS
  // =====================================
  
  badges: IUserBadge[];             // Liste de tous les badges obtenus
  recentBadges: IUserBadge[];       // Badges obtenus récemment (30 jours)
  pinnedBadges: IUserBadge[];       // Badges épinglés par l'utilisateur
  
  achievements: IAchievementProgress[]; // Progrès vers les accomplissements
  milestones: IMilestone[];         // Étapes importantes franchies
  
  // =====================================
  // ⏰ DONNÉES TEMPORELLES
  // =====================================
  
  // Dates importantes
  memberSince: Date;                // Date d'inscription
  firstTontineDate?: Date;          // Date de première tontine
  lastActivity: Date;               // Dernière activité
  lastPaymentDate?: Date;           // Date du dernier paiement
  lastReputationUpdate: Date;       // Dernière mise à jour du score
  
  // Ancienneté et expérience
  membershipDuration: number;       // Durée d'adhésion en jours
  experienceLevel: number;          // Niveau d'expérience (1-10)
  seniorityBonus: number;          // Bonus d'ancienneté (points)
  
  // =====================================
  // 📈 TENDANCES ET PRÉDICTIONS
  // =====================================
  
  // Données de tendance
  trends: {
    last7Days: TrendData[];         // Tendance sur 7 jours
    last30Days: TrendData[];        // Tendance sur 30 jours
    last90Days: TrendData[];        // Tendance sur 90 jours
    last12Months: TrendData[];      // Tendance sur 12 mois
  };
  
  // Analyse prédictive
  predictedScore30d?: number;       // Score prédit dans 30 jours
  predictedScore90d?: number;       // Score prédit dans 90 jours
  trendDirection: TrendDirection;   // Direction générale de la tendance
  volatility: number;               // Volatilité du score (0-100%)
  stability: number;                // Stabilité générale (0-100%)
  
  // =====================================
  // 🎯 ÉVALUATION DES RISQUES
  // =====================================
  
  riskLevel: RiskLevel;             // Niveau de risque global
  riskFactors: string[];            // Facteurs de risque identifiés
  riskScore: number;                // Score de risque (0-100, 100 = très risqué)
  
  // Indicateurs de risque spécifiques
  defaultRisk: number;              // Risque de défaut de paiement (0-100%)
  abandonmentRisk: number;          // Risque d'abandon de tontine (0-100%)
  conflictRisk: number;             // Risque de créer des conflits (0-100%)
  
  // =====================================
  // 🔄 MÉTADONNÉES ET CONFIGURATION
  // =====================================
  
  // Statut et validation
  isActive: boolean;                // Compte actif
  isVerified: boolean;              // Profil vérifié
  isSuspended: boolean;             // Compte suspendu
  
  // Configuration personnelle
  reputationVisibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE'; // Visibilité du profil
  allowReputationDisplay: boolean;   // Autoriser l'affichage public
  notifyOnScoreChange: boolean;     // Notifier les changements de score
  
  // Audit et traçabilité
  lastCalculationMethod: string;    // Méthode de calcul utilisée
  calculationVersion: string;       // Version de l'algorithme
  manualAdjustments: number;        // Nombre d'ajustements manuels
  
  // Métadonnées techniques
  createdAt: Date;                  // Date de création du profil
  updatedAt: Date;                  // Dernière mise à jour
  version: number;                  // Version du profil pour optimistic locking
}

// =====================================
// 🏅 INTERFACES DES BADGES
// =====================================

export interface IUserBadge {
  id: string;
  userId: string;
  badgeType: BadgeType;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  
  // Attribution
  awardedAt: Date;
  awardedBy?: string;               // ID de l'administrateur ou 'SYSTEM'
  reason: string;                   // Raison de l'attribution
  
  // Statut
  isActive: boolean;                // Badge actif
  isPinned: boolean;                // Badge épinglé
  isVisible: boolean;               // Badge visible publiquement
  
  // Métadonnées
  metadata: Record<string, any>;    // Données supplémentaires
  displayOrder: number;             // Ordre d'affichage
}

// =====================================
// 🎯 INTERFACES DES ACCOMPLISSEMENTS
// =====================================

export interface IAchievementProgress {
  achievementId: string;
  name: string;
  description: string;
  category: string;
  
  // Progrès
  currentProgress: number;          // Progrès actuel
  targetProgress: number;           // Objectif à atteindre
  progressPercentage: number;       // Pourcentage de completion (0-100%)
  
  // Récompenses
  scoreReward: number;              // Points de réputation à gagner
  badgeReward?: BadgeType;          // Badge à obtenir
  
  // État
  isCompleted: boolean;             // Accomplissement terminé
  completedAt?: Date;               // Date de completion
  
  // Visibilité
  isVisible: boolean;               // Visible dans le profil
  estimatedCompletion?: Date;       // Date estimée de completion
}

// =====================================
// 🏁 INTERFACES DES ÉTAPES
// =====================================

export interface IMilestone {
  id: string;
  name: string;
  description: string;
  type: 'SCORE' | 'LEVEL' | 'ACHIEVEMENT' | 'TIME' | 'SOCIAL';
  
  // Détails de l'étape
  achievedAt: Date;
  value: number;                    // Valeur atteinte (score, nombre, etc.)
  context: string;                  // Contexte de l'accomplissement
  
  // Récompenses
  rewardPoints: number;             // Points bonus accordés
  specialReward?: string;           // Récompense spéciale
  
  // Métadonnées
  isSignificant: boolean;           // Étape importante
  shareWorthy: boolean;             // Digne d'être partagée
  metadata: Record<string, any>;
} 
