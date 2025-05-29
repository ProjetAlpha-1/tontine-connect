import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // CORS pour le frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://tontineconnect.com'
    ],
    credentials: true,
  });

  // Validation globale
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Préfixe API
  app.setGlobalPrefix(configService.get('API_PREFIX', 'api/v1'));

  // Documentation Swagger
  const config = new DocumentBuilder()
    .setTitle('TontineConnect API')
    .setDescription('API pour la gestion des tontines digitales')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentification')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('tontines', 'Gestion des tontines')
    .addTag('payments', 'Gestion des paiements')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT', 3001);
  await app.listen(port);
  
  console.log(`🚀 TontineConnect API démarrée sur http://localhost:${port}`);
  console.log(`📚 Documentation Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
