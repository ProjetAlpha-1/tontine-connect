// backend/src/active/interfaces/dashboard-metrics.interface.ts

export interface DashboardMetrics {
  // Identifiants
  tontineId: string;
  generatedAt: Date;
  lastUpdated: Date;
  
  // Vue d'ensemble de la tontine
  tontineInfo: TontineOverview;
  
  // Cycle actuel
  currentCycle: CurrentCycleMetrics;
  
  // Statistiques des membres
  memberStats: MemberStatistics;
  
  // Métriques financières
  financialMetrics: FinancialMetrics;
  
  // Performance et tendances
  performanceMetrics: PerformanceMetrics;
  
  // Prochaines échéances
  upcomingEvents: UpcomingEvent[];
  
  // Alertes et notifications
  alerts: DashboardAlert[];
  
  // Historique récent
  recentActivity: RecentActivity[];
  
  // Graphiques et visualisations
  chartData: ChartData;
  
  // Comparaisons avec autres tontines (optionnel)
  benchmarks?: BenchmarkData;
}

export interface TontineOverview {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  
  // Progression générale
  totalMembers: number;
  currentCycle: number;
  totalCycles: number;
  progressPercentage: number;   // % de progression globale
  
  // Dates importantes
  startDate: Date;
  expectedEndDate: Date;
  actualEndDate?: Date;
  
  // Durée
  daysSinceStart: number;
  daysRemaining: number;
  totalDuration: number;
  
  // Statut santé
  healthScore: number;          // Score de santé 0-100
  healthStatus: 'excellent' | 'good' | 'warning' | 'critical';
  
  // Configuration de base
  frequency: 'weekly' | 'monthly';
  contributionAmount: number;
  currency: string;
}

export interface CurrentCycleMetrics {
  // Informations du cycle
  number: number;
  id: string;
  
  // Bénéficiaire
  payeeId: string;
  payeeName: string;
  payeePhoto?: string;
  
  // Progression financière
  expectedAmount: number;
  collectedAmount: number;
  remainingAmount: number;
  collectionPercentage: number;
  
  // Dates et délais
  startDate: Date;
  dueDate: Date;
  endDate: Date;
  daysRemaining: number;
  daysElapsed: number;
  isOverdue: boolean;
  daysOverdue?: number;
  
  // Participation
  expectedParticipants: number;
  paidParticipants: number;
  pendingParticipants: number;
  lateParticipants: number;
  participationRate: number;
  
  // Tendances
  dailyCollectionTrend: number[]; // Montants collectés par jour
  projectedCompletion: Date;
  
  // Statut
  status: 'pending' | 'active' | 'completed' | 'overdue';
  completionProbability: number; // % de chance de complétion à temps
}

export interface MemberStatistics {
  // Totaux
  totalActive: number;
  totalSuspended: number;
  totalCompleted: number;
  
  // Cycle actuel
  paidThisCycle: number;
  pendingThisCycle: number;
  lateThisCycle: number;
  exemptThisCycle: number;
  
  // Performance globale
  onTimePaymentRate: number;     // % de paiements à l'heure
  averagePaymentDelay: number;   // Retard moyen en jours
  completionRate: number;        // % de cycles complétés
  
  // Engagement
  activeParticipationRate: number;
  memberSatisfactionScore?: number;
  
  // Problèmes
  membersWithIssues: number;
  totalPenaltiesApplied: number;
  membersTurnover: number;       // Membres qui ont quitté
  
  // Répartition par statut
  membersByStatus: MemberStatusCount[];
  
  // Top performers
  topPerformers: TopPerformer[];
  
  // Membres à risque
  membersAtRisk: MemberAtRisk[];
}

export interface MemberStatusCount {
  status: string;
  count: number;
  percentage: number;
}

export interface TopPerformer {
  memberId: string;
  memberName: string;
  score: number;
  onTimePayments: number;
  totalContributions: number;
}

export interface MemberAtRisk {
  memberId: string;
  memberName: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskReasons: string[];
  consecutiveLatePayments: number;
  totalPenalties: number;
}

export interface FinancialMetrics {
  // Totaux globaux
  totalCollected: number;
  totalExpected: number;
  totalRemaining: number;
  collectionEfficiency: number;  // % du montant attendu collecté
  
  // Montants par cycle
  averageCycleAmount: number;
  highestCycleAmount: number;
  lowestCycleAmount: number;
  
  // Pénalités
  totalPenalties: number;
  penaltiesThisCycle: number;
  averagePenaltyAmount: number;
  penaltyRate: number;          // % de membres ayant des pénalités
  
  // Tendances financières
  monthlyCollectionTrend: MonthlyTrend[];
  collectionVelocity: number;   // Vitesse de collecte (montant/jour)
  
  // Projections
  projectedTotalCollection: number;
  projectedCompletionValue: number;
  estimatedLosses: number;
  
  // Comparaisons
  vsExpectedPerformance: number; // % par rapport à l'attendu
  vsLastCyclePerformance: number;
  
  // Répartition des sources
  paymentsByMethod: PaymentMethodStats[];
}

export interface MonthlyTrend {
  month: string;
  expected: number;
  actual: number;
  variance: number;
  efficiency: number;
}

export interface PaymentMethodStats {
  method: string;
  count: number;
  totalAmount: number;
  percentage: number;
  averageAmount: number;
}

export interface PerformanceMetrics {
  // Efficacité globale
  overallEfficiency: number;
  cycleCompletionRate: number;
  onTimeCompletionRate: number;
  
  // Délais
  averageCycleDuration: number;
  averagePaymentDelay: number;
  deadlineAdherenceRate: number;
  
  // Qualité
  paymentAccuracyRate: number;  // % de paiements exacts
  disputeRate: number;          // % de paiements contestés
  resolutionRate: number;       // % de problèmes résolus
  
  // Engagement
  memberRetentionRate: number;
  participationConsistency: number;
  communicationResponseRate: number;
  
  // Comparaisons temporelles
  performanceVsLastCycle: PerformanceComparison;
  performanceVsLastMonth: PerformanceComparison;
  performanceTrend: 'improving' | 'stable' | 'declining';
  
  // Scores calculés
  reliabilityScore: number;     // 0-100
  stabilityScore: number;       // 0-100
  satisfactionScore: number;    // 0-100
}

export interface PerformanceComparison {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface UpcomingEvent {
  id: string;
  type: 'payment_due' | 'cycle_start' | 'cycle_end' | 'member_turn' | 'meeting' | 'deadline';
  title: string;
  description: string;
  date: Date;
  daysUntil: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedMembers?: string[];
  actionRequired: boolean;
  actionUrl?: string;
}

export interface DashboardAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  category: 'payment' | 'member' | 'system' | 'deadline' | 'financial';
  
  // Contexte
  relatedEntityId?: string;
  relatedEntityType?: 'member' | 'cycle' | 'payment';
  
  // Actions
  actionable: boolean;
  suggestedActions?: string[];
  actionUrl?: string;
  
  // Timing
  createdAt: Date;
  expiresAt?: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  
  // Métadonnées
  count: number;               // Nombre d'occurrences
  lastOccurrence: Date;
  autoResolvable: boolean;
}

export interface RecentActivity {
  id: string;
  type: 'payment' | 'penalty' | 'member_action' | 'system' | 'admin_action';
  action: string;
  description: string;
  
  // Acteur
  performedBy: string;
  performerName: string;
  performerRole: 'member' | 'admin' | 'system';
  
  // Contexte
  relatedEntityId?: string;
  relatedEntityType?: string;
  amount?: number;
  
  // Résultat
  status: 'success' | 'failed' | 'pending';
  impact: 'positive' | 'negative' | 'neutral';
  
  // Timing
  performedAt: Date;
  
  // Visibilité
  isPublic: boolean;
  highlightLevel: 'normal' | 'important' | 'critical';
}

export interface ChartData {
  // Graphiques de collection
  collectionTrend: ChartDataPoint[];
  cycleCompletion: ChartDataPoint[];
  memberParticipation: ChartDataPoint[];
  
  // Graphiques financiers
  financialOverview: ChartDataPoint[];
  penaltyTrends: ChartDataPoint[];
  
  // Graphiques de performance
  performanceTrends: ChartDataPoint[];
  memberActivity: ChartDataPoint[];
  
  // Configuration des graphiques
  chartConfigs: ChartConfig[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: Date;
  category?: string;
  metadata?: Record<string, any>;
}

export interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
  options?: Record<string, any>;
}

export interface BenchmarkData {
  // Comparaisons avec moyennes
  industryAverage: PerformanceComparison[];
  platformAverage: PerformanceComparison[];
  similarTontines: PerformanceComparison[];
  
  // Classements
  ranking: {
    overall: number;
    totalTontines: number;
    percentile: number;
  };
  
  // Recommandations basées sur les benchmarks
  recommendations: BenchmarkRecommendation[];
}

export interface BenchmarkRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: string;
  actionSteps: string[];
}
