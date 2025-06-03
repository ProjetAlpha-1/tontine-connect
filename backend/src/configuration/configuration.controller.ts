// backend/src/configuration/configuration.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigurationService } from './configuration.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateConfigurationDto,
  UpdatePaymentOrderDto,
  UpdateFinalRulesDto,
  MemberAgreementDto,
  FinalizeConfigurationDto,
  ConfigurationResponse,
  PaymentOrderResponse,
  TontineConfiguration,
  ConfigurationValidation
} from './types/configuration-types';

@ApiTags('Configuration')
@Controller('tontines')
@UseGuards(JwtAuthGuard) // 🔄 RÉACTIVER
@ApiBearerAuth()
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  // 1. Créer une nouvelle configuration
  @Post(':id/configuration')
  @ApiOperation({ summary: 'Créer la configuration d\'une tontine' })
  @ApiResponse({ 
    status: 201, 
    description: 'Configuration créée avec succès'
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Accès refusé - seul le créateur peut configurer' })
  @ApiResponse({ status: 404, description: 'Tontine introuvable' })
  async createConfiguration(
    @Param('id') tontineId: string,
    @Body() createDto: CreateConfigurationDto,
    @Request() req: any
  ): Promise<ConfigurationResponse> {
    // 🐛 DEBUG : Vérification de l'utilisateur authentifié
    console.log('🔐 [POST Configuration] Utilisateur authentifié:', req.user);
    console.log('🔐 [POST Configuration] User ID (sub):', req.user?.sub);
    console.log('🔐 [POST Configuration] User ID (id):', req.user?.id);
    console.log('🎯 [POST Configuration] TontineId:', tontineId);
    console.log('📄 [POST Configuration] DTO avant:', createDto);

    createDto.tontineId = tontineId;
    
    console.log('📄 [POST Configuration] DTO après:', createDto);

    // 🔧 CORRECTION : Utiliser req.user.sub au lieu de req.user.id
    const userId = req.user?.sub || req.user?.id;
    console.log('👤 [POST Configuration] UserId utilisé:', userId);

    return this.configurationService.createConfiguration(createDto, userId);
  }

  // 2. Récupérer la configuration d'une tontine
  @Get(':id/configuration')
  @ApiOperation({ summary: 'Récupérer la configuration d\'une tontine' })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuration récupérée avec succès'
  })
  @ApiResponse({ status: 404, description: 'Configuration introuvable' })
  async getConfiguration(
    @Param('id') tontineId: string,
    @Request() req: any
  ): Promise<ConfigurationResponse> {
     // 🚨 DIAGNOSTIC CRITIQUE
    console.log('🔥🔥🔥 ROUTE CONFIGURATION APPELÉE !');
    console.log('🔥🔥🔥 TontineId reçu:', tontineId);
    console.log('🔥🔥🔥 Headers Authorization:', req.headers?.authorization);
    console.log('🔥🔥🔥 Utilisateur req.user:', req.user);
    console.log('🔥🔥🔥 Tous les headers:', req.headers);
    // 🐛 DEBUG : Vérification de l'utilisateur authentifié
    console.log('🔐 [GET Configuration] Utilisateur authentifié:', req.user);
    console.log('🎯 [GET Configuration] TontineId:', tontineId);

    return this.configurationService.getConfiguration(tontineId);
  }

  // 3. Mettre à jour l'ordre de paiement
  @Put(':id/configuration/payment-order')
  @ApiOperation({ summary: 'Mettre à jour l\'ordre de paiement' })
  @ApiResponse({ 
    status: 200, 
    description: 'Ordre de paiement mis à jour avec succès'
  })
  @ApiResponse({ status: 400, description: 'Ordre invalide' })
  @ApiResponse({ status: 403, description: 'Accès refusé - seul le créateur peut modifier' })
  async updatePaymentOrder(
    @Param('id') tontineId: string,
    @Body() updateDto: UpdatePaymentOrderDto,
    @Request() req: any
  ): Promise<PaymentOrderResponse> {
    console.log('🔐 [PUT Payment Order] Utilisateur authentifié:', req.user);
    
    // 🔧 CORRECTION : Utiliser req.user.sub au lieu de req.user.id
    const userId = req.user?.sub || req.user?.id;
    return this.configurationService.updatePaymentOrder(tontineId, updateDto, userId);
  }

  // 4. Mettre à jour les règles finales
  @Put(':id/configuration/final-rules')
  @ApiOperation({ summary: 'Mettre à jour les règles finales' })
  @ApiResponse({ 
    status: 200, 
    description: 'Règles mises à jour avec succès'
  })
  @ApiResponse({ status: 403, description: 'Accès refusé - seul le créateur peut modifier' })
  async updateFinalRules(
    @Param('id') tontineId: string,
    @Body() updateDto: UpdateFinalRulesDto,
    @Request() req: any
  ): Promise<TontineConfiguration> {
    console.log('🔐 [PUT Final Rules] Utilisateur authentifié:', req.user);
    
    // 🔧 CORRECTION : Utiliser req.user.sub au lieu de req.user.id
    const userId = req.user?.sub || req.user?.id;
    return this.configurationService.updateFinalRules(tontineId, updateDto, userId);
  }

  // 5. Accord d'un membre
  @Post(':id/configuration/agreement')
  @ApiOperation({ summary: 'Enregistrer l\'accord d\'un membre' })
  @ApiResponse({ 
    status: 200, 
    description: 'Accord enregistré avec succès'
  })
  @ApiResponse({ status: 404, description: 'Membre ou configuration introuvable' })
  async memberAgreement(
    @Param('id') tontineId: string,
    @Body() agreementDto: MemberAgreementDto,
    @Request() req: any
  ): Promise<TontineConfiguration> {
    console.log('🔐 [POST Agreement] Utilisateur authentifié:', req.user);
    
    return this.configurationService.memberAgreement(tontineId, agreementDto);
  }

  // 6. Finaliser la configuration
  @Post(':id/configuration/finalize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finaliser la configuration et activer la tontine' })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuration finalisée avec succès'
  })
  @ApiResponse({ status: 400, description: 'Configuration incomplète' })
  @ApiResponse({ status: 403, description: 'Accès refusé - seul le créateur peut finaliser' })
  async finalizeConfiguration(
    @Param('id') tontineId: string,
    @Request() req: any
  ): Promise<TontineConfiguration> {
    console.log('🔐 [POST Finalize] Utilisateur authentifié:', req.user);
    
    // 🔧 CORRECTION : Utiliser req.user.sub au lieu de req.user.id
    const userId = req.user?.sub || req.user?.id;
    const finalizeDto: FinalizeConfigurationDto = {
      tontineId,
      confirmedBy: userId
    };
    return this.configurationService.finalizeConfiguration(finalizeDto, userId);
  }

  // 7. Valider la configuration
  @Get(':id/configuration/validate')
  @ApiOperation({ summary: 'Valider l\'état de la configuration' })
  @ApiResponse({ 
    status: 200, 
    description: 'Validation effectuée'
  })
  async validateConfiguration(
    @Param('id') tontineId: string,
    @Request() req: any
  ): Promise<ConfigurationValidation> {
    console.log('🔐 [GET Validate] Utilisateur authentifié:', req.user);
    
    const configResponse = await this.configurationService.getConfiguration(tontineId);
    return this.configurationService.validateConfiguration(configResponse.configuration);
  }

  // 8. Obtenir l'ordre de paiement détaillé
  @Get(':id/configuration/payment-order')
  @ApiOperation({ summary: 'Récupérer l\'ordre de paiement avec détails des membres' })
  @ApiResponse({ 
    status: 200, 
    description: 'Ordre de paiement récupéré'
  })
  async getPaymentOrder(
    @Param('id') tontineId: string,
    @Request() req: any
  ): Promise<PaymentOrderResponse> {
    console.log('🔐 [GET Payment Order] Utilisateur authentifié:', req.user);
    
    const configResponse = await this.configurationService.getConfiguration(tontineId);
    
    // Récupérer les détails des membres depuis l'enrollment
    // (cette logique sera adaptée selon votre service enrollment)
    return {
      paymentOrder: configResponse.configuration.paymentOrder,
      members: [] // À remplir avec les données des membres
    };
  }
}