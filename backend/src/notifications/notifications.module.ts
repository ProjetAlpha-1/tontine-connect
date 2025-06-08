// backend/src/notifications/notifications.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import du service existant
import { NotificationService } from './notification.service';

// Import des entités (si elles existent)
// import { Notification } from './entities/notification.entity';

@Module({
  imports: [
    // TypeORM entities - Décommentez si l'entité existe
    // TypeOrmModule.forFeature([
    //   Notification,
    // ]),
  ],
  
  providers: [
    NotificationService,
  ],
  
  exports: [
    NotificationService, // Export pour utilisation dans d'autres modules
  ],
})
export class NotificationsModule {
  constructor() {
    console.log('📢 NotificationsModule initialized');
  }
} 
