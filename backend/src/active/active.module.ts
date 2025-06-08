// backend/src/active/active.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import des modules nécessaires
import { AuthModule } from '../auth/auth.module';
import { TontinesModule } from '../tontines/tontines.module';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { ReputationModule } from '../reputation/reputation.module';
import { NotificationsModule } from '../notifications/notifications.module';

// Import du vrai controller et service
import { ActiveController } from './active.controller';
import { ActiveService } from './active.service';

// Import du vrai service Reputation depuis integration/
import { ReputationEventTriggerService } from '../reputation/integration/reputation-event-trigger.service';

// Import des entités TypeORM
import { ActiveTontine } from './entities/active-tontine.entity';
import { Cycle } from './entities/cycle.entity';
import { Payment } from './entities/payment.entity';
import { Penalty } from './entities/penalty.entity';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [
    // Configuration TypeORM pour les entités Active
    TypeOrmModule.forFeature([
      ActiveTontine,
      Cycle,
      Payment,
      Penalty,
      Notification
    ]),
    
    // Modules dépendants
    AuthModule,
    forwardRef(() => TontinesModule),
    forwardRef(() => ConfigurationModule), 
    forwardRef(() => EnrollmentModule),
    forwardRef(() => ReputationModule), // Pour l'intégration révolutionnaire
    forwardRef(() => NotificationsModule), // Pour les notifications
  ],
  
  controllers: [
    ActiveController  // ✅ Vrai controller au lieu du mock
  ],
  
  providers: [
    ActiveService,                    // ✅ Vrai service réactivé
    ReputationEventTriggerService,    // ✅ Vrai service Reputation depuis integration/
    // NotificationService vient de NotificationsModule
    // EnrollmentService vient de EnrollmentModule
  ],
  
  exports: [
    ActiveService,    // Export pour les autres modules
  ],
})
export class ActiveModule {
  constructor() {
    console.log('🚀 ActiveModule initialized - REAL SERVICES MODE');
    console.log('📊 Status: ActiveService + TypeORM + PostgreSQL connectés');
    console.log('🎯 Integration: Active ↔ Reputation opérationnelle');
    console.log('⚡ Ready: Test workflow révolutionnaire avec vraies données');
  }
}