// backend/src/configuration/configuration.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';
import { TontinesModule } from '../tontines/tontines.module';
import { AuthModule } from '../auth/auth.module'; // 🔥 AJOUT CRUCIAL

@Module({
  imports: [
    PassportModule,      // 🔥 AJOUT : Nécessaire pour Passport
    JwtModule,          // 🔥 AJOUT : Nécessaire pour JWT
    AuthModule,         // 🔥 AJOUT : Fournit JwtAuthGuard et JwtStrategy
    TontinesModule,     // ✅ CONSERVÉ : Pour accéder au TontinesService
    // Note: EnrollmentModule sera ajouté quand il sera disponible
  ],
  controllers: [ConfigurationController],
  providers: [ConfigurationService],
  exports: [ConfigurationService] // Exporter pour usage dans d'autres modules
})
export class ConfigurationModule {}