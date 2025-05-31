// backend/src/tontines/enrollment.module.ts

import { Module } from '@nestjs/common';
import { EnrollmentService } from './services/enrollment.service';
import { EnrollmentController } from './controllers/enrollment.controller';

@Module({
  providers: [EnrollmentService],
  controllers: [EnrollmentController],
  exports: [EnrollmentService], // Pour utiliser dans d'autres modules
})
export class EnrollmentModule {}

// Mise à jour du fichier backend/src/tontines/tontines.module.ts
// (ajoutez cette importation à votre module existant)

/*
import { Module } from '@nestjs/common';
import { TontinesService } from './tontines.service';
import { TontinesController } from './tontines.controller';
import { EnrollmentModule } from './enrollment.module'; // NOUVEAU

@Module({
  imports: [EnrollmentModule], // NOUVEAU
  providers: [TontinesService],
  controllers: [TontinesController],
  exports: [TontinesService],
})
export class TontinesModule {}
*/ 
