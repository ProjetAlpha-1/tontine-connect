// backend/src/active/active.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { ActiveController } from './active.controller';
import { ActiveService } from './active.service';

// Import des modules nécessaires
import { AuthModule } from '../auth/auth.module';
import { TontinesModule } from '../tontines/tontines.module';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';

// Import des services dépendants
import { TontinesService } from '../tontines/tontines.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { EnrollmentService } from '../enrollment/enrollment.service';

@Module({
  imports: [
    // Module d'authentification pour les guards JWT
    AuthModule,
    
    // Modules nécessaires pour les dépendances
    // Utilisation de forwardRef pour éviter les dépendances circulaires
    forwardRef(() => TontinesModule),
    forwardRef(() => ConfigurationModule),
    forwardRef(() => EnrollmentModule),
  ],
  
  controllers: [
    ActiveController
  ],
  
  providers: [
    ActiveService,
    
    // Services injectés (si pas déjà disponibles via les modules)
    // Ces services seront injectés automatiquement si les modules sont correctement importés
    // TontinesService,
    // ConfigurationService, 
    // EnrollmentService,
  ],
  
  exports: [
    // Exporter le service Active pour usage dans d'autres modules
    ActiveService,
  ],
})
export class ActiveModule {
  constructor() {
    console.log('🚀 ActiveModule initialized - Gestion des tontines actives');
  }
}
