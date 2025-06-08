// backend/src/reputation/types/reputation-types.ts

/**
 * 🎯 Types et Enums du Système de Réputation - Tontine Connect v0.6.0
 * 
 * Ce fichier contient tous les types de base et enums utilisés dans le système de réputation.
 * Il définit les fondations sur lesquelles tout le module de réputation est construit.
 */

// =====================================
// 🏆 NIVEAUX DE RÉPUTATION
// =====================================

/**
 * Niveaux de réputation des utilisateurs (0-1000 points)
 */
export enum ReputationLevel {
  BRONZE = 'BRONZE',       // 0-199 points
  SILVER = 'SILVER',       // 200-399 points  
  GOLD = 'GOLD',           // 400-649 points
  PLATINUM = 'PLATINUM',   // 650-849 points
  DIAMOND = 'DIAMOND'      // 850-1000 points
}

/**
 * Seuils de points pour chaque niveau
 */
export const REPUTATION_LEVEL_THRESHOLDS: Record<ReputationLevel, number> = {
  [ReputationLevel.BRONZE]: 0,
  [ReputationLevel.SILVER]: 200,
  [ReputationLevel.GOLD]: 400,
  [ReputationLevel.PLATINUM]: 650,
  [ReputationLevel.DIAMOND]: 850
};

// =====================================
// 🏅 SYSTÈME DE BADGES
// =====================================

/**
 * Types de badges disponibles dans le système
 */
export enum BadgeType {
  // 💰 Badges de Performance Financière
  PUNCTUAL_PAYER = 'PUNCTUAL_PAYER',           // Payeur ponctuel
  EARLY_BIRD = 'EARLY_BIRD',                   // Paiements en avance
  PERFECT_ATTENDANCE = 'PERFECT_ATTENDANCE',    // Participation parfaite
  CYCLE_CHAMPION = 'CYCLE_CHAMPION',           // Champion de cycle
  ZERO_PENALTY = 'ZERO_PENALTY',              // Aucune pénalité
  
  // 🤝 Badges de Fidélité et Ancienneté
  VETERAN_MEMBER = 'VETERAN_MEMBER',           // Membre vétéran
  TONTINE_CREATOR = 'TONTINE_CREATOR',         // Créateur de tontines
  COMMUNITY_BUILDER = 'COMMUNITY_BUILDER',     // Bâtisseur de communauté
  LOYAL_PARTICIPANT = 'LOYAL_PARTICIPANT',     // Participant fidèle
  LONG_TERM_MEMBER = 'LONG_TERM_MEMBER',       // Membre long terme
  
  // 🌟 Badges d'Excellence Sociale
  DISPUTE_RESOLVER = 'DISPUTE_RESOLVER',       // Résolveur de conflits
  MENTOR = 'MENTOR',                           // Mentor
  AMBASSADOR = 'AMBASSADOR',                   // Ambassadeur
  PEACEKEEPER = 'PEACEKEEPER',                 // Gardien de la paix
  HELPFUL_MEMBER = 'HELPFUL_MEMBER',           // Membre serviable
  
  // 🚀 Badges Spéciaux et Achievements
  EARLY_ADOPTER = 'EARLY_ADOPTER',             // Adopteur précoce
  INNOVATOR = 'INNOVATOR',                     // Innovateur
  RECORD_HOLDER = 'RECORD_HOLDER',             // Détenteur de record
  PERFECTIONIST = 'PERFECTIONIST',             // Perfectionniste
  GAME_CHANGER = 'GAME_CHANGER'                // Révolutionnaire
}

/**
 * Catégories de badges pour l'organisation
 */
export enum BadgeCategory {
  PERFORMANCE = 'PERFORMANCE',     // Performance financière
  LOYALTY = 'LOYALTY',             // Fidélité et ancienneté
  SOCIAL = 'SOCIAL',               // Excellence sociale
  ACHIEVEMENT = 'ACHIEVEMENT',     // Accomplissements spéciaux
  SPECIAL = 'SPECIAL'              // Badges exceptionnels
}

/**
 * Rareté des badges
 */
export enum BadgeRarity {
  COMMON = 'COMMON',           // 60% des utilisateurs peuvent l'obtenir
  UNCOMMON = 'UNCOMMON',       // 30% des utilisateurs
  RARE = 'RARE',               // 8% des utilisateurs
  EPIC = 'EPIC',               // 2% des utilisateurs
  LEGENDARY = 'LEGENDARY'      // <1% des utilisateurs
}

// =====================================
// 📊 ÉVÉNEMENTS DE RÉPUTATION
// =====================================

/**
 * Types d'événements qui impactent la réputation
 */
export enum ReputationEventType {
  // ✅ Événements Positifs
  PAYMENT_ON_TIME = 'PAYMENT_ON_TIME',         // Paiement à temps
  PAYMENT_EARLY = 'PAYMENT_EARLY',             // Paiement en avance
  CYCLE_COMPLETION = 'CYCLE_COMPLETION',       // Complétion de cycle
  TONTINE_COMPLETION = 'TONTINE_COMPLETION',   // Complétion de tontine
  MEMBER_INVITATION = 'MEMBER_INVITATION',     // Invitation de membres
  DISPUTE_RESOLUTION = 'DISPUTE_RESOLUTION',   // Résolution de conflit
  HELP_PROVIDED = 'HELP_PROVIDED',             // Aide fournie
  POSITIVE_FEEDBACK = 'POSITIVE_FEEDBACK',     // Feedback positif reçu
  
  // ❌ Événements Négatifs
  PAYMENT_LATE = 'PAYMENT_LATE',               // Paiement en retard
  PAYMENT_MISSED = 'PAYMENT_MISSED',           // Paiement manqué
  PENALTY_APPLIED = 'PENALTY_APPLIED',         // Pénalité appliquée
  TONTINE_ABANDONMENT = 'TONTINE_ABANDONMENT', // Abandon de tontine
  DISPUTE_CAUSED = 'DISPUTE_CAUSED',           // Conflit causé
  NEGATIVE_FEEDBACK = 'NEGATIVE_FEEDBACK',     // Feedback négatif reçu
  RULE_VIOLATION = 'RULE_VIOLATION',           // Violation de règles
  
  // ⚪ Événements Neutres
  REPUTATION_REVIEW = 'REPUTATION_REVIEW',     // Révision de réputation
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',     // Ajustement manuel
  BADGE_AWARDED = 'BADGE_AWARDED',             // Badge attribué
  LEVEL_CHANGED = 'LEVEL_CHANGED'              // Changement de niveau
}

/**
 * Catégories d'événements pour le calcul
 */
export enum EventCategory {
  PAYMENT = 'PAYMENT',           // Événements de paiement
  PARTICIPATION = 'PARTICIPATION', // Événements de participation
  SOCIAL = 'SOCIAL',             // Événements sociaux
  PENALTY = 'PENALTY',           // Événements de pénalité
  ACHIEVEMENT = 'ACHIEVEMENT',   // Événements d'accomplissement
  ADMINISTRATIVE = 'ADMINISTRATIVE' // Événements administratifs
}

// =====================================
// ⚖️ CONFIGURATION DES POIDS
// =====================================
/**
 * Sévérité des événements pour l'impact sur la réputation
 */
export enum EventSeverity {
  MINOR = 'MINOR',           // Impact mineur (-5 à +5 points)
  MODERATE = 'MODERATE',     // Impact modéré (-15 à +15 points)
  MAJOR = 'MAJOR',           // Impact majeur (-30 à +30 points)
  CRITICAL = 'CRITICAL',     // Impact critique (-50 à +50 points)
  EXCEPTIONAL = 'EXCEPTIONAL' // Impact exceptionnel (-100 à +100 points)
}

/**
 * Mapping des événements vers leur sévérité par défaut
 */
export const EVENT_SEVERITY_MAPPING: Record<ReputationEventType, EventSeverity> = {
  // Événements positifs
  [ReputationEventType.PAYMENT_ON_TIME]: EventSeverity.MODERATE,
  [ReputationEventType.PAYMENT_EARLY]: EventSeverity.MAJOR,
  [ReputationEventType.CYCLE_COMPLETION]: EventSeverity.MAJOR,
  [ReputationEventType.TONTINE_COMPLETION]: EventSeverity.CRITICAL,
  [ReputationEventType.MEMBER_INVITATION]: EventSeverity.MINOR,
  [ReputationEventType.DISPUTE_RESOLUTION]: EventSeverity.MAJOR,
  [ReputationEventType.HELP_PROVIDED]: EventSeverity.MINOR,
  [ReputationEventType.POSITIVE_FEEDBACK]: EventSeverity.MINOR,
  
  // Événements négatifs
  [ReputationEventType.PAYMENT_LATE]: EventSeverity.MODERATE,
  [ReputationEventType.PAYMENT_MISSED]: EventSeverity.MAJOR,
  [ReputationEventType.PENALTY_APPLIED]: EventSeverity.MODERATE,
  [ReputationEventType.TONTINE_ABANDONMENT]: EventSeverity.CRITICAL,
  [ReputationEventType.DISPUTE_CAUSED]: EventSeverity.MAJOR,
  [ReputationEventType.NEGATIVE_FEEDBACK]: EventSeverity.MINOR,
  [ReputationEventType.RULE_VIOLATION]: EventSeverity.MAJOR,
  
  // Événements neutres
  [ReputationEventType.REPUTATION_REVIEW]: EventSeverity.MINOR,
  [ReputationEventType.MANUAL_ADJUSTMENT]: EventSeverity.MODERATE,
  [ReputationEventType.BADGE_AWARDED]: EventSeverity.MINOR,
  [ReputationEventType.LEVEL_CHANGED]: EventSeverity.MINOR
};
/**
 * Structure pour la pondération des facteurs de réputation
 */
export interface ReputationWeight {
  paymentPunctuality: number;    // Ponctualité des paiements (35%)
  participationRate: number;     // Taux de participation (25%)
  completionRate: number;        // Taux de complétion (20%)
  socialContribution: number;    // Contribution sociale (10%)
  experiencePoints: number;      // Points d'expérience (5%)
  penaltyImpact: number;         // Impact des pénalités (-5%)
}

/**
 * Poids par défaut pour le calcul de réputation
 */
export const DEFAULT_REPUTATION_WEIGHTS: ReputationWeight = {
  paymentPunctuality: 0.35,    // 35%
  participationRate: 0.25,     // 25%
  completionRate: 0.20,        // 20%
  socialContribution: 0.10,    // 10%
  experiencePoints: 0.05,      // 5%
  penaltyImpact: -0.05         // -5%
};

// =====================================
// 📈 DONNÉES DE TENDANCE
// =====================================

/**
 * Structure pour les données de tendance temporelle
 */
export interface TrendData {
  period: string;              // Période (ex: "2024-01", "2024-W01")
  score: number;               // Score à cette période
  events: number;              // Nombre d'événements
  trend: TrendDirection;       // Direction de la tendance
  velocity: number;            // Vitesse de changement
}

/**
 * Direction des tendances
 */
export enum TrendDirection {
  IMPROVING = 'IMPROVING',     // En amélioration
  STABLE = 'STABLE',          // Stable
  DECLINING = 'DECLINING'     // En déclin
}

/**
 * Périodes pour l'analyse de tendances
 */
export enum TrendPeriod {
  DAILY = 'DAILY',           // Tendances quotidiennes
  WEEKLY = 'WEEKLY',         // Tendances hebdomadaires
  MONTHLY = 'MONTHLY',       // Tendances mensuelles
  QUARTERLY = 'QUARTERLY',   // Tendances trimestrielles
  YEARLY = 'YEARLY'          // Tendances annuelles
}

// =====================================
// 🎯 NIVEAUX DE RISQUE
// =====================================

/**
 * Niveaux de risque pour l'évaluation des utilisateurs
 */
export enum RiskLevel {
  VERY_LOW = 'VERY_LOW',     // Risque très faible
  LOW = 'LOW',               // Risque faible
  MEDIUM = 'MEDIUM',         // Risque moyen
  HIGH = 'HIGH',             // Risque élevé
  VERY_HIGH = 'VERY_HIGH'    // Risque très élevé
}

/**
 * Niveaux de confiance pour les tontines
 */
export enum TrustLevel {
  VERY_HIGH = 'VERY_HIGH',   // Confiance très élevée (90-100%)
  HIGH = 'HIGH',             // Confiance élevée (75-89%)
  MEDIUM = 'MEDIUM',         // Confiance moyenne (50-74%)
  LOW = 'LOW',               // Confiance faible (25-49%)
  VERY_LOW = 'VERY_LOW'      // Confiance très faible (0-24%)
}

// =====================================
// 🔧 TYPES UTILITAIRES
// =====================================

/**
 * Configuration des seuils pour les calculs
 */
export interface ReputationThresholds {
  excellentScore: number;      // Score excellent (800+)
  goodScore: number;          // Bon score (600+)
  averageScore: number;       // Score moyen (400+)
  poorScore: number;          // Score faible (200+)
  criticalScore: number;      // Score critique (<200)
}

/**
 * Seuils par défaut
 */
export const DEFAULT_THRESHOLDS: ReputationThresholds = {
  excellentScore: 800,
  goodScore: 600,
  averageScore: 400,
  poorScore: 200,
  criticalScore: 0
};

/**
 * Multiplicateurs pour les événements selon le contexte
 */
export interface EventMultipliers {
  firstTime: number;           // Premier événement de ce type
  consecutive: number;         // Événements consécutifs
  frequency: number;           // Multiplicateur de fréquence
  recency: number;            // Multiplicateur de récence
  severity: number;           // Multiplicateur de sévérité
}

/**
 * Configuration temporelle pour la décroissance
 */
export interface TemporalDecayConfig {
  enabled: boolean;            // Décroissance activée
  decayRate: number;          // Taux de décroissance (par jour)
  minimumRetention: number;   // Rétention minimale (%)
  exemptEvents: ReputationEventType[]; // Événements exempts
} 
