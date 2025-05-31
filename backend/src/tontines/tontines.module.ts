// backend/src/tontines/tontines.module.ts
import { Module } from '@nestjs/common';
import { TontinesController } from './tontines.controller';
import { TontinesService } from './tontines.service';
import { EnrollmentModule } from './enrollment.module';

@Module({
  imports: [EnrollmentModule],
  controllers: [TontinesController],
  providers: [TontinesService],
  exports: [TontinesService], // Pour pouvoir utiliser le service dans d'autres modules
})
export class TontinesModule {} 
