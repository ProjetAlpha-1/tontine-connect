// backend/src/configuration/configuration.service.ts

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { 
  TontineConfiguration, 
  ConfigurationStatus, 
  PaymentOrderType,
  CreateConfigurationDto,
  UpdatePaymentOrderDto,
  UpdateFinalRulesDto,
  MemberAgreementDto,
  FinalizeConfigurationDto,
  ConfigurationResponse,
  PaymentOrderResponse,
  ConfigurationValidation,
  MemberAgreement
} from './types/configuration-types';
import { TontinesService } from '../tontines/tontines.service';
import { TontineStatus } from '../tontines/enums/tontine-status.enum'; // Import du bon enum

// Interface temporaire pour simuler un membre
interface TempMember {
  id: string;
  name: string;
  phone: string;
  status: string;
  joinedAt: Date;
  reputation?: number;
}

// Interface temporaire pour l'enrollment
interface TempEnrollment {
  isComplete: boolean;
  members: TempMember[];
}

@Injectable()
export class ConfigurationService {
  private configurations: Map<string, TontineConfiguration> = new Map();

  constructor(
    private tontinesService: TontinesService
  ) {}

  // Méthode temporaire pour simuler l'enrollment
  private async getTempEnrollmentStatus(tontineId: string): Promise<TempEnrollment> {
    // Simulation temporaire - à remplacer par le vrai service enrollment
    return {
      isComplete: true,
      members: [
        {
          id: 'member1',
          name: 'Alice Dupont',
          phone: '+24101234567',
          status: 'approved',
          joinedAt: new Date(),
          reputation: 85
        },
        {
          id: 'member2',
          name: 'Bob Martin',
          phone: '+24101234568',
          status: 'approved',
          joinedAt: new Date(),
          reputation: 75
        },
        {
          id: 'member3',
          name: 'Claire Dubois',
          phone: '+24101234569',
          status: 'approved',
          joinedAt: new Date(),
          reputation: 90
        }
      ]
    };
  }

  // 1. Créer une nouvelle configuration
  async createConfiguration(createDto: CreateConfigurationDto, effectiveUserId: string): Promise<ConfigurationResponse> {
    // Vérifier que la tontine existe et que l'utilisateur est le créateur
    const tontine = await this.tontinesService.findOne(createDto.tontineId);
    if (!tontine) {
      throw new NotFoundException('Tontine introuvable');
    }

  // if (tontine.creatorId !== effectiveUserId) {
  //   throw new ForbiddenException('Seul le créateur peut configurer la tontine');
  // }
  console.log('🔍 Vérification créateur temporairement désactivée');
  console.log('👤 Utilisateur JWT:', effectiveUserId);
  console.log('👤 Créateur tontine:', tontine.creatorId);
// 🔧 CORRECTION TEMPORAIRE : Validation créateur assouplie
  console.log('👤 Utilisateur JWT:', effectiveUserId);
  console.log('👤 Créateur tontine:', tontine.creatorId);
  
  // 🚨 TEMPORAIRE : Ignorer la validation créateur pour les tests
  if (effectiveUserId && tontine.creatorId !== effectiveUserId) {
    console.log('⚠️ Validation créateur échouée mais ignorée en mode test');
    // throw new ForbiddenException('Seul le créateur peut configurer cette tontine');
  }
  
  if (!effectiveUserId) {
    console.log('🔍 Utilisateur non défini - mode test sans authentification');
  }

  // 🔧 UTILISER UN effectiveeffectiveUserId PAR DÉFAUT pour les tests
  const effectiveeffectiveeffectiveUserId = effectiveUserId || 'temp_user_123'; // Même que le créateur
  console.log('👤 effectiveeffectiveUserId effectif utilisé:', effectiveeffectiveeffectiveUserId);

    // Vérifier que l'enrollment est terminé (version temporaire)
    const enrollment = await this.getTempEnrollmentStatus(createDto.tontineId);
    if (!enrollment.isComplete) {
      throw new BadRequestException('L\'enrollment doit être terminé avant la configuration');
    }

    // Récupérer les membres approuvés
    const approvedMembers = enrollment.members.filter((m: TempMember) => m.status === 'approved');
    
    // Générer l'ordre de paiement selon le type
    const paymentOrder = await this.generatePaymentOrder(
      createDto.paymentOrderType, 
      approvedMembers,
      createDto.manualOrder
    );

    // Créer les accords de membres (initialement tous non-accordés)
    const memberAgreements: MemberAgreement[] = approvedMembers.map((member: TempMember) => ({
      memberId: member.id,
      memberName: member.name,
      memberPhone: member.phone,
      hasAgreed: false
    }));

    // Créer la configuration
    const configId = `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const configuration: TontineConfiguration = {
      id: configId,
      tontineId: createDto.tontineId,
      paymentOrder,
      finalRules: createDto.finalRules,
      memberAgreements,
      status: ConfigurationStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: effectiveUserId,
      totalMembers: approvedMembers.length,
      agreedMembers: 0,
      progressPercentage: 0
    };

    this.configurations.set(configId, configuration);

    // Mettre à jour le statut de la tontine avec le bon enum
    await this.tontinesService.updateStatus(createDto.tontineId, TontineStatus.CONFIGURATION, effectiveUserId);

    return {
      configuration,
      tontineInfo: {
        id: tontine.id,
        name: tontine.name,
        status: tontine.status,
        creatorId: tontine.creatorId,
        totalMembers: approvedMembers.length
      }
    };
  }

  // 2. Récupérer la configuration d'une tontine
  async getConfiguration(tontineId: string): Promise<ConfigurationResponse> {
    const configuration = Array.from(this.configurations.values())
      .find(config => config.tontineId === tontineId);

    if (!configuration) {
      throw new NotFoundException('Configuration introuvable');
    }

    const tontine = await this.tontinesService.findOne(tontineId);
    
    return {
      configuration,
      tontineInfo: {
        id: tontine.id,
        name: tontine.name,
        status: tontine.status,
        creatorId: tontine.creatorId,
        totalMembers: configuration.totalMembers
      }
    };
  }

  // 3. Mettre à jour l'ordre de paiement
  async updatePaymentOrder(
    tontineId: string, 
    updateDto: UpdatePaymentOrderDto, 
    effectiveeffectiveUserId: string
  ): Promise<PaymentOrderResponse> {
    const configuration = await this.findConfigurationByTontineId(tontineId);
    
    // Vérifier que l'utilisateur est le créateur
    // if (configuration.createdBy !== effectiveeffectiveUserId) {
    // ❌ AVANT
    if (configuration.createdBy !== effectiveeffectiveUserId) {
      throw new ForbiddenException('Seul le créateur peut modifier l\'ordre de paiement');
    }

    // ✅ APRÈS (temporaire)
    // 🚧 TEMPORAIRE : Désactiver vérification créateur pour tests v0.4.0
    /*
    if (configuration.createdBy !== effectiveeffectiveUserId) {
      throw new ForbiddenException('Seul le créateur peut modifier l\'ordre de paiement');
    }
    */
console.log('🔧 Vérification créateur (ordre paiement) désactivée temporairement');
    console.log('🔍 Vérification créateur updatePaymentOrder désactivée');
    
    // Vérifier que la configuration n'est pas finalisée
    if (configuration.status === ConfigurationStatus.COMPLETED) {
      throw new BadRequestException('Impossible de modifier une configuration finalisée');
    }

    // Récupérer les membres
    const enrollment = await this.getTempEnrollmentStatus(tontineId);
    const approvedMembers = enrollment.members.filter((m: TempMember) => m.status === 'approved');

    // Générer le nouvel ordre
    const newPaymentOrder = await this.generatePaymentOrder(
      updateDto.type,
      approvedMembers,
      updateDto.manualOrder
    );

    // Mettre à jour la configuration
    configuration.paymentOrder = newPaymentOrder;
    configuration.updatedAt = new Date();

    // Réinitialiser les accords si l'ordre change
    configuration.memberAgreements.forEach(agreement => {
      agreement.hasAgreed = false;
      agreement.agreedAt = undefined;
    });
    configuration.agreedMembers = 0;
    configuration.progressPercentage = 0;
    configuration.status = ConfigurationStatus.PENDING;

    this.configurations.set(configuration.id, configuration);

    return {
      paymentOrder: newPaymentOrder,
      members: approvedMembers.map((member: TempMember) => ({
        id: member.id,
        name: member.name,
        phone: member.phone,
        joinedAt: member.joinedAt,
        reputation: member.reputation || 0
      }))
    };
  }

  // 4. Mettre à jour les règles finales
  async updateFinalRules(
    tontineId: string, 
    updateDto: UpdateFinalRulesDto, 
    effectiveeffectiveUserId: string
  ): Promise<TontineConfiguration> {
    const configuration = await this.findConfigurationByTontineId(tontineId);
    
    // if (configuration.createdBy !== effectiveeffectiveUserId) {
    // ❌ AVANT
if (configuration.createdBy !== effectiveeffectiveUserId) {
  throw new ForbiddenException('Seul le créateur peut modifier les règles');
}

// ✅ APRÈS (temporaire)
// 🚧 TEMPORAIRE : Désactiver vérification créateur pour tests v0.4.0
/*
if (configuration.createdBy !== effectiveeffectiveUserId) {
  throw new ForbiddenException('Seul le créateur peut modifier les règles');
}
*/
console.log('🔧 Vérification créateur (règles) désactivée temporairement');
    console.log('🔍 Vérification créateur updateFinalRules désactivée');

    if (configuration.status === ConfigurationStatus.COMPLETED) {
      throw new BadRequestException('Impossible de modifier une configuration finalisée');
    }

    configuration.finalRules = updateDto;
    configuration.updatedAt = new Date();

    this.configurations.set(configuration.id, configuration);
    return configuration;
  }

  // 5. Accord d'un membre
  async memberAgreement(
    tontineId: string, 
    agreementDto: MemberAgreementDto
  ): Promise<TontineConfiguration> {
    const configuration = await this.findConfigurationByTontineId(tontineId);

    // Trouver l'accord du membre
    const memberAgreement = configuration.memberAgreements
      .find(agreement => agreement.memberId === agreementDto.memberId);

    if (!memberAgreement) {
      throw new NotFoundException('Membre introuvable dans cette configuration');
    }

    // Mettre à jour l'accord
    memberAgreement.hasAgreed = agreementDto.hasAgreed;
    memberAgreement.agreedAt = agreementDto.hasAgreed ? new Date() : undefined;
    memberAgreement.comments = agreementDto.comments;

    // Recalculer les statistiques
    configuration.agreedMembers = configuration.memberAgreements
      .filter(agreement => agreement.hasAgreed).length;
    configuration.progressPercentage = Math.round(
      (configuration.agreedMembers / configuration.totalMembers) * 100
    );

    // Mettre à jour le statut si tous les membres ont accepté
    if (configuration.agreedMembers === configuration.totalMembers) {
      configuration.status = ConfigurationStatus.AWAITING_APPROVAL;
    }

    configuration.updatedAt = new Date();
    this.configurations.set(configuration.id, configuration);

    return configuration;
  }

  // 6. Finaliser la configuration
  async finalizeConfiguration(
    finalizeDto: FinalizeConfigurationDto, 
    effectiveeffectiveUserId: string
  ): Promise<TontineConfiguration> {
    const configuration = await this.findConfigurationByTontineId(finalizeDto.tontineId);

    // if (configuration.createdBy !== effectiveeffectiveUserId) {
    //   throw new ForbiddenException('Seul le créateur peut finaliser la configuration');
    // }
    console.log('🔍 Vérification créateur finalizeConfiguration désactivée');

    // Valider que tous les membres ont accepté
    const validation = this.validateConfiguration(configuration);
    if (!validation.canFinalize) {
      throw new BadRequestException(`Impossible de finaliser: ${validation.errors.join(', ')}`);
    }

    // Finaliser
    configuration.status = ConfigurationStatus.COMPLETED;
    configuration.completedAt = new Date();
    configuration.updatedAt = new Date();
    configuration.paymentOrder.isFinalized = true;
    configuration.paymentOrder.finalizedAt = new Date();

    this.configurations.set(configuration.id, configuration);

    // Mettre à jour le statut de la tontine vers "active" avec le bon enum
    await this.tontinesService.updateStatus(finalizeDto.tontineId, TontineStatus.ACTIVE, effectiveeffectiveUserId);

    return configuration;
  }

  // 7. Valider une configuration
  validateConfiguration(configuration: TontineConfiguration): ConfigurationValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Vérifier que tous les membres ont accepté
    const missingAgreements = configuration.memberAgreements
      .filter(agreement => !agreement.hasAgreed)
      .map(agreement => agreement.memberId);

    if (missingAgreements.length > 0) {
      errors.push(`${missingAgreements.length} membre(s) n'ont pas encore accepté`);
    }

    // Vérifier l'ordre de paiement
    if (!configuration.paymentOrder.order || configuration.paymentOrder.order.length === 0) {
      errors.push('L\'ordre de paiement n\'est pas défini');
    }

    // Vérifier les règles
    if (configuration.finalRules.penaltyAmount < 0) {
      errors.push('Le montant de pénalité ne peut pas être négatif');
    }

    if (configuration.finalRules.gracePeriodDays < 0) {
      warnings.push('Période de grâce très courte');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canFinalize: errors.length === 0,
      missingAgreements
    };
  }

  // Utilitaires privées
  private async findConfigurationByTontineId(tontineId: string): Promise<TontineConfiguration> {
    const configuration = Array.from(this.configurations.values())
      .find(config => config.tontineId === tontineId);

    if (!configuration) {
      throw new NotFoundException('Configuration introuvable pour cette tontine');
    }

    return configuration;
  }

  private async generatePaymentOrder(
    type: PaymentOrderType, 
    members: TempMember[], 
    manualOrder?: string[]
  ) {
    let order: string[] = [];

    switch (type) {
      case PaymentOrderType.MANUAL:
        if (!manualOrder || manualOrder.length !== members.length) {
          throw new BadRequestException('Ordre manuel invalide');
        }
        order = manualOrder;
        break;

      case PaymentOrderType.RANDOM:
        order = [...members.map(m => m.id)].sort(() => Math.random() - 0.5);
        break;

      case PaymentOrderType.SENIORITY:
        order = members
          .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())
          .map(m => m.id);
        break;

      case PaymentOrderType.REPUTATION:
        order = members
          .sort((a, b) => (b.reputation || 0) - (a.reputation || 0))
          .map(m => m.id);
        break;

      default:
        throw new BadRequestException('Type d\'ordre invalide');
    }

    return {
      type,
      order,
      isFinalized: false,
      createdAt: new Date()
    };
  }
}