// backend/src/tontines/tontines.module.ts
// 🔧 VERSION CONNECTÉE v0.5.0 - TypeORM ActiveTontine + EnrollmentRequest
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TontinesController } from './tontines.controller';
import { TontinesService } from './tontines.service';
import { EnrollmentController } from './controllers/enrollment.controller';
import { EnrollmentService } from './services/enrollment.service';
import { ActiveTontine } from '../active/entities/active-tontine.entity';
import { EnrollmentRequest } from './entities/enrollment-request.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActiveTontine,
      EnrollmentRequest, // ← AJOUTÉ pour résoudre EnrollmentRequestRepository
      User               // ← AJOUTÉ pour résoudre UserRepository
    ])
  ],
  controllers: [
    TontinesController,
    EnrollmentController
  ],
  providers: [
    TontinesService,
    EnrollmentService
  ],
  exports: [
    TontinesService,
    EnrollmentService  // ← AJOUTÉ pour ActiveModule
  ]
})
export class TontinesModule {}