// frontend/src/services/configurationService.ts

import { apiClient } from './api';
import type {
  ConfigurationResponse,
  PaymentOrderResponse,
  TontineConfiguration,
  ConfigurationValidation,
  CreateConfigurationFormData,
  UpdatePaymentOrderFormData,
  MemberAgreementFormData,
  FinalRules
} from '../types/configuration';

class ConfigurationService {
  private baseUrl = '/tontines';

  // 1. Créer une nouvelle configuration
  async createConfiguration(
    tontineId: string, 
    data: CreateConfigurationFormData
  ): Promise<ConfigurationResponse> {
    const payload = {
      tontineId,
      paymentOrderType: data.paymentOrderType,
      finalRules: {
        penaltyAmount: data.penaltyAmount,
        gracePeriodDays: data.gracePeriodDays,
        maxMissedPayments: data.maxMissedPayments,
        interestRate: data.interestRate,
        customRules: data.customRules || []
      },
      manualOrder: data.manualOrder
    };

    const response = await apiClient.post(
      `${this.baseUrl}/${tontineId}/configuration`,
      payload
    );
    return response.data;
  }

  // 2. Récupérer la configuration d'une tontine
  async getConfiguration(tontineId: string): Promise<ConfigurationResponse> {
    const response = await apiClient.get(`${this.baseUrl}/${tontineId}/configuration`);
    return response.data;
  }

  // 3. Mettre à jour l'ordre de paiement
  async updatePaymentOrder(
    tontineId: string, 
    data: UpdatePaymentOrderFormData
  ): Promise<PaymentOrderResponse> {
    const response = await apiClient.put(
      `${this.baseUrl}/${tontineId}/configuration/payment-order`,
      data
    );
    return response.data;
  }

  // 4. Mettre à jour les règles finales
  async updateFinalRules(
    tontineId: string, 
    rules: FinalRules
  ): Promise<TontineConfiguration> {
    const response = await apiClient.put(
      `${this.baseUrl}/${tontineId}/configuration/final-rules`,
      rules
    );
    return response.data;
  }

  // 5. Enregistrer l'accord d'un membre
  async memberAgreement(
    tontineId: string,
    memberId: string,
    data: MemberAgreementFormData
  ): Promise<TontineConfiguration> {
    const payload = {
      memberId,
      hasAgreed: data.hasAgreed,
      comments: data.comments
    };

    const response = await apiClient.post(
      `${this.baseUrl}/${tontineId}/configuration/agreement`,
      payload
    );
    return response.data;
  }

  // 6. Finaliser la configuration
  async finalizeConfiguration(tontineId: string): Promise<TontineConfiguration> {
    const response = await apiClient.post(
      `${this.baseUrl}/${tontineId}/configuration/finalize`
    );
    return response.data;
  }

  // 7. Valider la configuration
  async validateConfiguration(tontineId: string): Promise<ConfigurationValidation> {
    const response = await apiClient.get(
      `${this.baseUrl}/${tontineId}/configuration/validate`
    );
    return response.data;
  }

  // 8. Récupérer l'ordre de paiement avec détails
  async getPaymentOrder(tontineId: string): Promise<PaymentOrderResponse> {
    const response = await apiClient.get(
      `${this.baseUrl}/${tontineId}/configuration/payment-order`
    );
    return response.data;
  }

  // Méthodes utilitaires

  // Vérifier si l'utilisateur peut modifier la configuration
  canUserModifyConfiguration(configuration: TontineConfiguration, userId: string): boolean {
    return configuration.createdBy === userId && 
           configuration.status !== 'completed';
  }

  // Vérifier si l'utilisateur peut finaliser
  canUserFinalizeConfiguration(
    configuration: TontineConfiguration, 
    userId: string,
    validation: ConfigurationValidation
  ): boolean {
    return this.canUserModifyConfiguration(configuration, userId) && 
           validation.canFinalize;
  }

  // Calculer le pourcentage de progression
  calculateProgress(configuration: TontineConfiguration): {
    percentage: number;
    agreedCount: number;
    totalCount: number;
    remainingCount: number;
  } {
    const agreedCount = configuration.agreedMembers;
    const totalCount = configuration.totalMembers;
    const remainingCount = totalCount - agreedCount;
    const percentage = totalCount > 0 ? Math.round((agreedCount / totalCount) * 100) : 0;

    return {
      percentage,
      agreedCount,
      totalCount,
      remainingCount
    };
  }

  // Obtenir les membres qui n'ont pas encore accepté
  getPendingMembers(configuration: TontineConfiguration) {
    return configuration.memberAgreements.filter(agreement => !agreement.hasAgreed);
  }

  // Obtenir les membres qui ont accepté
  getAgreedMembers(configuration: TontineConfiguration) {
    return configuration.memberAgreements.filter(agreement => agreement.hasAgreed);
  }

  // Formater les erreurs de validation
  formatValidationErrors(validation: ConfigurationValidation): string[] {
    const messages: string[] = [];
    
    if (validation.errors.length > 0) {
      messages.push(...validation.errors);
    }
    
    if (validation.warnings.length > 0) {
      messages.push(...validation.warnings.map(w => `⚠️ ${w}`));
    }
    
    return messages;
  }

  // Générer un message de statut lisible
  getStatusMessage(configuration: TontineConfiguration): string {
    const progress = this.calculateProgress(configuration);
    
    switch (configuration.status) {
      case 'pending':
        return `Configuration en cours (${progress.agreedCount}/${progress.totalCount} membres ont accepté)`;
      case 'awaiting_approval':
        return 'Tous les membres ont accepté - Prêt à finaliser';
      case 'completed':
        return 'Configuration terminée - Tontine activée';
      case 'cancelled':
        return 'Configuration annulée';
      default:
        return 'Statut inconnu';
    }
  }
}

export default new ConfigurationService();