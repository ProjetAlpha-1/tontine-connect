import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TontinesModule } from './tontines/tontines.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { ActiveModule } from './active/active.module';
import { ReputationModule } from './reputation/reputation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'tontine_user',
      password: 'password123',
      database: 'tontine_connect',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // ⚠️ Seulement en développement
      logging: true,     // Pour voir les requêtes SQL en dev
    }),
    AuthModule,
    UsersModule,
    TontinesModule,
    ConfigurationModule,
    ActiveModule,        // ✅ Module Active Management ajouté
    ReputationModule,    // ✅ Module Reputation ajouté
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}