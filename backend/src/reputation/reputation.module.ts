// backend/src/reputation/reputation.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';

// Core components
import { ReputationController } from './reputation.controller';
import { ReputationService } from './reputation.service';

// Algorithms
import { ReputationCalculator } from './algorithms/reputation-calculator';
import { TontineScoring } from './algorithms/tontine-scoring';

// Entities (à créer selon votre architecture de DB)
// import { UserReputation } from './entities/user-reputation.entity';
// import { TontineReputation } from './entities/tontine-reputation.entity';
// import { ReputationEvent } from './entities/reputation-event.entity';
// import { UserBadge } from './entities/user-badge.entity';

// External modules (selon votre architecture)
// import { UsersModule } from '../users/users.module';
// import { TontinesModule } from '../tontines/tontines.module';
// import { NotificationsModule } from '../notifications/notifications.module';

/**
 * 🧠 Module Principal du Système de Réputation - Tontine Connect v0.6.0
 * 
 * Ce module configure et assemble tous les composants du système de réputation :
 * - Services et algorithmes de calcul
 * - Controller et routes API
 * - Gestion du cache et des tâches asynchrones
 * - Intégrations avec les autres modules
 * - Configuration des entités de base de données
 */

@Module({
  imports: [
    // =====================================
    // 📊 CONFIGURATION BASE DE DONNÉES
    // =====================================
    
    // TypeORM entities - Décommentez selon vos entités
    // TypeOrmModule.forFeature([
    //   UserReputation,
    //   TontineReputation, 
    //   ReputationEvent,
    //   UserBadge,
    //   Achievement,
    //   ReputationMetrics
    // ]),

    // =====================================
    // ⚡ CONFIGURATION CACHE
    // =====================================
    
    CacheModule.register({
      ttl: 300, // 5 minutes par défaut
      max: 1000, // 1000 éléments max en cache
      store: 'memory', // Ou 'redis' en production
    }),

    // =====================================
    // 📅 CONFIGURATION TÂCHES PROGRAMMÉES
    // =====================================
    
    ScheduleModule.forRoot(),

    // =====================================
    // 🔄 CONFIGURATION QUEUES ASYNCHRONES
    // =====================================
    
    BullModule.registerQueue(
      {
        name: 'reputation-calculations',
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
      {
        name: 'reputation-notifications',
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 10,
          attempts: 2,
          delay: 1000,
        },
      },
      {
        name: 'reputation-maintenance',
        defaultJobOptions: {
          removeOnComplete: 5,
          removeOnFail: 5,
          attempts: 1,
        },
      }
    ),

    // =====================================
    // 🔗 INTÉGRATIONS AUTRES MODULES
    // =====================================
    
    // Imports conditionnels selon votre architecture
    // forwardRef(() => UsersModule),
    // forwardRef(() => TontinesModule), 
    // forwardRef(() => NotificationsModule),
    // forwardRef(() => PaymentsModule),
    // forwardRef(() => ConfigurationModule),
  ],

  // =====================================
  // 🎯 CONTROLLERS EXPOSÉS
  // =====================================
  
  controllers: [
    ReputationController,
  ],

  // =====================================
  // 🔧 SERVICES ET PROVIDERS
  // =====================================
  
  providers: [
    // Service principal
    ReputationService,
    
    // Algorithmes de calcul
    ReputationCalculator,
    TontineScoring,
    
    // =====================================
    // 📊 PROVIDERS DE CONFIGURATION
    // =====================================
    
    {
      provide: 'REPUTATION_CONFIG',
      useValue: {
        // Configuration par défaut
        algorithm: {
          version: '1.0.0',
          weights: {
            paymentPunctuality: 0.35,
            participationRate: 0.25,
            completionRate: 0.20,
            socialContribution: 0.10,
            experiencePoints: 0.05,
            penaltyImpact: -0.05,
          },
          levelThresholds: {
            BRONZE: 0,
            SILVER: 200,
            GOLD: 400,
            PLATINUM: 650,
            DIAMOND: 850,
          },
        },
        cache: {
          userReputationTTL: 300, // 5 minutes
          tontineReputationTTL: 600, // 10 minutes
          metricsTTL: 180, // 3 minutes
          leaderboardTTL: 900, // 15 minutes
        },
        notifications: {
          scoreChangeThreshold: 10,
          levelChangeNotification: true,
          badgeNotification: true,
          weeklyDigest: true,
        },
        maintenance: {
          dailyRecalculation: '0 2 * * *', // 2h du matin
          weeklyMaintenance: '0 3 * * 0', // Dimanche 3h
          monthlyArchive: '0 1 1 * *', // 1er du mois 1h
        },
        compliance: {
          dataRetentionDays: 1095, // 3 ans
          auditLogRetention: 2555, // 7 ans
          gdprEnabled: true,
          anonymizationDelay: 30, // 30 jours après demande
        },
        features: {
          temporalDecay: true,
          peerComparison: true,
          predictiveAnalytics: true,
          badgeSystem: true,
          disputeResolution: true,
          bulkOperations: true,
        },
      },
    },

    // =====================================
    // 📈 PROVIDERS D'ANALYTICS
    // =====================================
    
    {
      provide: 'ANALYTICS_CONFIG',
      useValue: {
        sampling: {
          metricsCalculation: 0.1, // 10% sampling pour heavy analytics
          trendsAnalysis: 0.05, // 5% sampling pour ML
          correlationAnalysis: 0.02, // 2% sampling pour corrélations
        },
        ml: {
          enablePredictions: true,
          modelRefreshDays: 7,
          confidenceThreshold: 0.8,
          maxPredictionHorizon: 90, // jours
        },
        performance: {
          slowQueryThreshold: 1000, // ms
          cacheHitRateTarget: 0.85,
          maxConcurrentCalculations: 50,
        },
      },
    },

    // =====================================
    // 🔧 PROVIDERS UTILITAIRES
    // =====================================
    
    {
      provide: 'LOGGER_CONFIG',
      useValue: {
        levels: ['error', 'warn', 'info', 'debug'],
        auditEvents: true,
        performanceMetrics: true,
        userActionLogging: true,
        adminActionLogging: true,
      },
    },

    // =====================================
    // 🎯 PROVIDERS DE VALIDATION
    // =====================================
    
    {
      provide: 'VALIDATION_CONFIG',
      useValue: {
        strictValidation: true,
        sanitizeInputs: true,
        maxBatchSize: 100,
        maxQueryResults: 1000,
        rateLimiting: {
          calculationsPerMinute: 60,
          queriesPerMinute: 1000,
          adminActionsPerHour: 100,
        },
      },
    },

    // =====================================
    // 🔐 PROVIDERS DE SÉCURITÉ
    // =====================================
    
    {
      provide: 'SECURITY_CONFIG',
      useValue: {
        requireAuth: true,
        adminRoles: ['ADMIN', 'REPUTATION_MANAGER'],
        userRoles: ['USER', 'PREMIUM_USER'],
        sensitiveOperations: [
          'MANUAL_SCORE_ADJUSTMENT',
          'BULK_ADJUSTMENTS', 
          'CONFIG_CHANGES',
          'DATA_EXPORT',
          'ANONYMIZATION',
        ],
        auditRequired: [
          'SCORE_ADJUSTMENTS',
          'BADGE_OPERATIONS',
          'CONFIG_CHANGES',
          'DISPUTE_RESOLUTIONS',
        ],
      },
    },
  ],

  // =====================================
  // 📤 SERVICES EXPORTÉS
  // =====================================
  
  exports: [
    // Services principaux exportés pour autres modules
    ReputationService,
    ReputationCalculator,
    TontineScoring,
    
    // Configuration exportée
    'REPUTATION_CONFIG',
    'ANALYTICS_CONFIG',
  ],
})
export class ReputationModule {
  
  // =====================================
  // 🔧 CONFIGURATION DYNAMIQUE DU MODULE
  // =====================================
  
  /**
   * Configuration for root module (App-level)
   */
  static forRoot(config?: {
    database?: {
      entities?: any[];
      synchronize?: boolean;
    };
    cache?: {
      store?: string;
      host?: string;
      port?: number;
      ttl?: number;
    };
    queue?: {
      redis?: {
        host?: string;
        port?: number;
        password?: string;
      };
    };
    features?: {
      temporalDecay?: boolean;
      predictiveAnalytics?: boolean;
      badgeSystem?: boolean;
    };
  }) {
    return {
      module: ReputationModule,
      providers: [
        {
          provide: 'DYNAMIC_CONFIG',
          useValue: config || {},
        },
      ],
      exports: ['DYNAMIC_CONFIG'],
    };
  }

  /**
   * Configuration for feature modules
   */
  static forFeature(features: string[]) {
    const providers = features.map(feature => ({
      provide: `FEATURE_${feature.toUpperCase()}`,
      useValue: true,
    }));

    return {
      module: ReputationModule,
      providers,
      exports: providers.map(p => p.provide),
    };
  }

  // =====================================
  // 🚀 LIFECYCLE HOOKS
  // =====================================

  constructor() {
    console.log('🧠 ReputationModule initialized');
    console.log('📊 Features: Temporal Decay, Predictive Analytics, Badge System');
    console.log('🔄 Queues: Calculations, Notifications, Maintenance');
    console.log('⚡ Cache: Memory store with 5min TTL');
    console.log('📅 Scheduled: Daily recalculations, Weekly maintenance');
  }

  // Méthodes de cycle de vie optionnelles
  async onModuleInit() {
    console.log('✅ ReputationModule fully initialized');
    // Initialisation personnalisée si nécessaire
  }

  async onModuleDestroy() {
    console.log('🔄 ReputationModule shutting down');
    // Nettoyage personnalisé si nécessaire
  }
}

/**
 * 📊 EXEMPLE D'UTILISATION DANS APP.MODULE.TS
 * 
 * @Module({
 *   imports: [
 *     // Configuration de base
 *     ReputationModule.forRoot({
 *       cache: {
 *         store: 'redis',
 *         host: 'localhost',
 *         port: 6379,
 *         ttl: 300,
 *       },
 *       features: {
 *         temporalDecay: true,
 *         predictiveAnalytics: true,
 *         badgeSystem: true,
 *       },
 *     }),
 * 
 *     // Ou configuration simple
 *     ReputationModule,
 *   ],
 * })
 * export class AppModule {}
 */

/**
 * 🔗 INTÉGRATION AVEC AUTRES MODULES
 * 
 * // Dans users.module.ts
 * @Module({
 *   imports: [
 *     ReputationModule.forFeature(['USER_SCORING']),
 *   ],
 * })
 * 
 * // Dans tontines.module.ts  
 * @Module({
 *   imports: [
 *     ReputationModule.forFeature(['TONTINE_SCORING', 'HEALTH_MONITORING']),
 *   ],
 * })
 */

/**
 * 📈 MONITORING ET MÉTRIQUES
 * 
 * Le module expose automatiquement :
 * - Health checks sur /api/v1/reputation/admin/system/health
 * - Métriques sur /api/v1/reputation/admin/system/metrics  
 * - Performance stats sur /api/v1/reputation/admin/performance/stats
 */

/**
 * 🔐 SÉCURITÉ ET PERMISSIONS
 * 
 * Routes publiques :
 * - GET /api/v1/reputation/users/:id (lecture propre réputation)
 * - GET /api/v1/reputation/leaderboard (classements publics)
 * 
 * Routes utilisateur authentifié :
 * - Toutes les routes de consultation
 * - Actions sur ses propres données
 * 
 * Routes administrateur :
 * - /api/v1/reputation/admin/**
 * - Actions de modification sur autres utilisateurs
 * - Configuration système
 */  
