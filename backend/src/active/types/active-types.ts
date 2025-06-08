// backend/src/active/types/active-types.ts

// ===== TYPES DE STATUT =====

export type TontineActiveStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export type CycleStatus = 'pending' | 'active' | 'completed' | 'overdue' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'confirmed' | 'late' | 'penalty_applied' | 'partial' | 'cancelled';

export type PenaltyStatus = 'pending' | 'applied' | 'paid' | 'waived' | 'disputed' | 'cancelled';

export type NotificationStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'delivered' | 'failed' | 'cancelled';

export type MemberActiveStatus = 'active' | 'suspended' | 'excluded' | 'completed';

// ===== TYPES DE MÉTHODES ET CANAUX =====

export type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'check' | 'other';

export type MobileMoneyProvider = 'moov' | 'airtel' | 'other';

export type NotificationChannel = 'sms' | 'email' | 'push' | 'in_app' | 'whatsapp';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

// ===== TYPES DE CALCULATEURS =====

export type PenaltyCalculationMethod = 'fixed' | 'percentage' | 'daily' | 'escalating' | 'custom';

export type PenaltyType = 'late_payment' | 'missed_payment' | 'partial_payment' | 'behavior' | 'manual' | 'automatic';

export type PenaltyCategory = 'financial' | 'behavioral' | 'administrative';

// ===== TYPES DE RÉCURRENCE =====

export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'custom';

export type RecurrenceStatus = 'active' | 'paused' | 'completed' | 'cancelled';

// ===== TYPES D'ÉVÉNEMENTS =====

export type EventType = 'payment_due' | 'cycle_start' | 'cycle_end' | 'member_turn' | 'meeting' | 'deadline';

export type AlertType = 'warning' | 'error' | 'info' | 'success';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ActivityType = 'payment' | 'penalty' | 'member_action' | 'system' | 'admin_action';

// ===== TYPES DE RÔLES ET PERMISSIONS =====

export type UserRole = 'member' | 'admin' | 'observer' | 'system';

export type PerformerRole = 'member' | 'admin' | 'system';

export type TrustLevel = 'low' | 'medium' | 'high';

export type RiskLevel = 'low' | 'medium' | 'high';

// ===== TYPES DE PERFORMANCE =====

export type HealthStatus = 'excellent' | 'good' | 'warning' | 'critical';

export type PerformanceTrend = 'improving' | 'stable' | 'declining';

export type TrendDirection = 'up' | 'down' | 'stable';

export type ImpactType = 'positive' | 'negative' | 'neutral';

export type ImpactLevel = 'none' | 'minor' | 'major' | 'severe';

// ===== TYPES DE GRAPHIQUES =====

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter';

// ===== INTERFACES UTILITAIRES =====

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface AmountRange {
  minAmount: number;
  maxAmount: number;
  currency?: string;
}

export interface TimeWindow {
  windowStart: Date;
  windowEnd: Date;
  durationMinutes: number;
}

// ===== TYPES DE FILTRES =====

export interface ActiveTontineFilters {
  status?: TontineActiveStatus[];
  healthStatus?: HealthStatus[];
  memberCountRange?: [number, number];
  amountRange?: AmountRange;
  dateRange?: DateRange;
  hasIssues?: boolean;
  searchTerm?: string;
}

export interface CycleFilters {
  status?: CycleStatus[];
  payeeIds?: string[];
  dateRange?: DateRange;
  amountRange?: AmountRange;
  hasOverduePayments?: boolean;
  completionRange?: [number, number]; // % completion
}

export interface PaymentFilters {
  status?: PaymentStatus[];
  memberIds?: string[];
  methods?: PaymentMethod[];
  dateRange?: DateRange;
  amountRange?: AmountRange;
  hasAttachments?: boolean;
  requiresConfirmation?: boolean;
}

export interface PenaltyFilters {
  status?: PenaltyStatus[];
  types?: PenaltyType[];
  categories?: PenaltyCategory[];
  memberIds?: string[];
  dateRange?: DateRange;
  amountRange?: AmountRange;
  disputed?: boolean;
  waived?: boolean;
}

export interface NotificationFilters {
  status?: NotificationStatus[];
  types?: string[];
  priorities?: NotificationPriority[];
  channels?: NotificationChannel[];
  dateRange?: DateRange;
  recipientIds?: string[];
  hasResponses?: boolean;
}

// ===== TYPES DE PAGINATION =====

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// ===== TYPES DE RECHERCHE =====

export interface SearchOptions {
  term: string;
  fields?: string[];
  fuzzy?: boolean;
  caseSensitive?: boolean;
  exactMatch?: boolean;
}

export interface SearchResult<T> {
  item: T;
  score: number;
  matchedFields: string[];
  highlights?: Record<string, string>;
}

// ===== TYPES DE VALIDATION =====

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

// ===== TYPES DE CALCULS =====

export interface CalculationConfig {
  method: string;
  parameters: Record<string, any>;
  precision?: number;
  roundingMode?: 'round' | 'floor' | 'ceil';
}

export interface CalculationResult {
  value: number;
  currency?: string;
  calculatedAt: Date;
  method: string;
  inputs: Record<string, any>;
  breakdown?: CalculationBreakdown[];
}

export interface CalculationBreakdown {
  component: string;
  value: number;
  description: string;
  percentage?: number;
}

// ===== TYPES D'AGRÉGATION =====

export interface AggregationOptions {
  groupBy: string[];
  metrics: AggregationMetric[];
  filters?: Record<string, any>;
  timeGranularity?: 'hour' | 'day' | 'week' | 'month' | 'year';
}

export interface AggregationMetric {
  field: string;
  operation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct';
  alias?: string;
}

export interface AggregationResult {
  groups: AggregationGroup[];
  totalGroups: number;
  calculatedAt: Date;
}

export interface AggregationGroup {
  key: Record<string, any>;
  metrics: Record<string, number>;
  count: number;
}

// ===== TYPES DE CONFIGURATION =====

export interface ActiveModuleConfig {
  // Limites système
  maxActiveTontines: number;
  maxMembersPerTontine: number;
  maxCyclesPerTontine: number;
  
  // Paramètres de performance
  cacheExpirationMinutes: number;
  maxNotificationsPerBatch: number;
  calculationPrecision: number;
  
  // Seuils d'alerte
  overdueThresholdDays: number;
  riskAssessmentThreshold: number;
  healthScoreThresholds: {
    excellent: number;
    good: number;
    warning: number;
  };
  
  // Paramètres de notification
  defaultReminderDays: number[];
  maxRetryAttempts: number;
  notificationCooldownMinutes: number;
  
  // Paramètres financiers
  defaultCurrency: string;
  maxPenaltyPercentage: number;
  gracePeriodDays: number;
}

// ===== TYPES D'EXPORT =====

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  fields?: string[];
  filters?: Record<string, any>;
  dateRange?: DateRange;
  includeMetadata?: boolean;
  includeCalculations?: boolean;
}

export interface ExportResult {
  fileUrl: string;
  fileName: string;
  format: string;
  size: number;
  recordCount: number;
  generatedAt: Date;
  expiresAt?: Date;
}

// ===== TYPES DE SYNCHRONISATION =====

export interface SyncOptions {
  forceFull?: boolean;
  entities?: string[];
  lastSyncTimestamp?: Date;
  batchSize?: number;
}

export interface SyncResult {
  success: boolean;
  entitiesSynced: number;
  entitiesSkipped: number;
  entitiesErrored: number;
  errors: SyncError[];
  syncDuration: number;
  completedAt: Date;
}

export interface SyncError {
  entityId: string;
  entityType: string;
  error: string;
  retryable: boolean;
}
