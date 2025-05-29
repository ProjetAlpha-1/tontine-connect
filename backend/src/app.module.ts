import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // TypeORM temporairement désactivé - on l'activera plus tard
    // TypeOrmModule.forRootAsync({...}),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
