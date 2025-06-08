// backend/src/active/dto/dashboard.dto.ts

import { IsOptional, IsString, IsBoolean, IsArray, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HealthStatus, TontineActiveStatus } from '../types/active-types';

export class GetDashboardDto {
  @ApiPropertyOptional({
    description: 'Inclure les données de benchmark',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeBenchmarks?: boolean = false;

  @ApiPropertyOptional({
    description: 'Inclure les données des graphiques',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeCharts?: boolean = true;

  @ApiPropertyOptional({
    description: 'Inclure l\'historique des activités récentes',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeRecentActivity?: boolean = true;

  @ApiPropertyOptional({
    description: 'Nombre d\'activités récentes à inclure',
    example: 10,
    minimum: 1,
    maximum: 50,
    default: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  recentActivityLimit?: number = 10;

  @ApiPropertyOptional({
    description: 'Inclure les alertes et notifications',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeAlerts?: boolean = true;

  @ApiPropertyOptional({
    description: 'Nombre maximum d\'alertes à inclure',
    example: 5,
    minimum: 1,
    maximum: 20,
    default: 5
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  alertsLimit?: number = 5;

  @ApiPropertyOptional({
    description: 'Inclure les événements à venir',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeUpcomingEvents?: boolean = true;

  @ApiPropertyOptional({
    description: 'Nombre de jours pour les événements à venir',
    example: 30,
    minimum: 1,
    maximum: 365,
    default: 30
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  @Type(() => Number)
  upcomingEventsDays?: number = 30;

  @ApiPropertyOptional({
    description: 'Forcer le recalcul des métriques',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  forceRecalculation?: boolean = false;
}

export class DashboardFiltersDto {
  @ApiPropertyOptional({
    description: 'Filtrer par statut de santé',
    enum: ['excellent', 'good', 'warning', 'critical'],
    isArray: true,
    example: ['good', 'excellent']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['excellent', 'good', 'warning', 'critical'], { each: true })
  healthStatus?: HealthStatus[];

  @ApiPropertyOptional({
    description: 'Filtrer par statut de la tontine',
    enum: ['active', 'paused', 'completed', 'cancelled'],
    isArray: true,
    example: ['active']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['active', 'paused', 'completed', 'cancelled'], { each: true })
  status?: TontineActiveStatus[];

  @ApiPropertyOptional({
    description: 'Date de début pour les métriques',
    example: '2024-01-01',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Date de fin pour les métriques',
    example: '2024-12-31',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Inclure seulement les tontines avec des problèmes',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  onlyWithIssues?: boolean = false;

  @ApiPropertyOptional({
    description: 'Granularité temporelle pour les graphiques',
    enum: ['day', 'week', 'month'],
    example: 'week',
    default: 'week'
  })
  @IsOptional()
  @IsEnum(['day', 'week', 'month'])
  timeGranularity?: 'day' | 'week' | 'month' = 'week';
}

export class UpdateDashboardConfigDto {
  @ApiPropertyOptional({
    description: 'Configuration des widgets à afficher',
    example: ['overview', 'current_cycle', 'financial_metrics'],
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enabledWidgets?: string[];

  @ApiPropertyOptional({
    description: 'Fréquence de rafraîchissement automatique en secondes',
    example: 300,
    minimum: 30,
    maximum: 3600
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(3600)
  refreshInterval?: number;

  @ApiPropertyOptional({
    description: 'Seuils personnalisés pour les alertes',
    example: {
      overduePayments: 2,
      lowParticipation: 80,
      highPenalties: 5
    }
  })
  @IsOptional()
  alertThresholds?: {
    overduePayments?: number;
    lowParticipation?: number;
    highPenalties?: number;
    [key: string]: number | undefined;
};

  @ApiPropertyOptional({
    description: 'Préférences d\'affichage des graphiques',
    example: {
      defaultChartType: 'line',
      showDataLabels: true,
      animationEnabled: true
    }
  })
  @IsOptional()
  chartPreferences?: {
    defaultChartType?: 'line' | 'bar' | 'pie' | 'area';
    showDataLabels?: boolean;
    animationEnabled?: boolean;
    colorScheme?: string;
    [key: string]: any;
  };

  @ApiPropertyOptional({
    description: 'Notification automatique des métriques critiques',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  enableCriticalAlerts?: boolean = true;
}

export class DashboardMetricsQueryDto {
  @ApiProperty({
    description: 'Type de métrique demandée',
    enum: [
      'overview',
      'financial',
      'performance',
      'members',
      'cycles',
      'payments',
      'penalties',
      'notifications'
    ],
    example: 'overview'
  })
  @IsString()
  @IsEnum([
    'overview',
    'financial',
    'performance',
    'members',
    'cycles',
    'payments',
    'penalties',
    'notifications'
  ])
  metricType: string;

  @ApiPropertyOptional({
    description: 'Période d\'agrégation',
    enum: ['today', 'week', 'month', 'quarter', 'year', 'all'],
    example: 'month',
    default: 'month'
  })
  @IsOptional()
  @IsEnum(['today', 'week', 'month', 'quarter', 'year', 'all'])
  period?: string = 'month';

  @ApiPropertyOptional({
    description: 'Comparer avec la période précédente',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  compareWithPrevious?: boolean = false;

  @ApiPropertyOptional({
    description: 'Inclure les tendances et projections',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeTrends?: boolean = false;

  @ApiPropertyOptional({
    description: 'Format de réponse souhaité',
    enum: ['summary', 'detailed', 'raw'],
    example: 'detailed',
    default: 'detailed'
  })
  @IsOptional()
  @IsEnum(['summary', 'detailed', 'raw'])
  format?: string = 'detailed';
}
