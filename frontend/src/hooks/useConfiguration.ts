// frontend/src/hooks/useConfiguration.ts

import { useState, useEffect } from 'react';
import configurationService from '../services/configurationService';
import type {
  ConfigurationResponse,
  TontineConfiguration,
  ConfigurationValidation,
  PaymentOrderResponse,
  CreateConfigurationFormData,
  UpdatePaymentOrderFormData,
  MemberAgreementFormData
} from '../types/configuration';

export interface UseConfigurationReturn {
  // État
  configuration: TontineConfiguration | null;
  tontineInfo: any;
  validation: ConfigurationValidation | null;
  paymentOrder: PaymentOrderResponse | null;
  
  // États de chargement
  loading: boolean;
  creating: boolean;
  updating: boolean;
  finalizing: boolean;
  
  // États d'erreur
  error: string | null;
  
  // Actions
  loadConfiguration: () => Promise<void>;
  createConfiguration: (data: CreateConfigurationFormData) => Promise<boolean>;
  updatePaymentOrder: (data: UpdatePaymentOrderFormData) => Promise<boolean>;
  updateFinalRules: (rules: any) => Promise<boolean>;
  memberAgreement: (memberId: string, data: MemberAgreementFormData) => Promise<boolean>;
  finalizeConfiguration: () => Promise<boolean>;
  validateConfiguration: () => Promise<void>;
  
  // Utilitaires
  canModify: boolean;
  canFinalize: boolean;
  progress: {
    percentage: number;
    agreedCount: number;
    totalCount: number;
    remainingCount: number;
  };
  statusMessage: string;
}

export const useConfiguration = (tontineId: string, userId?: string): UseConfigurationReturn => {
  // États principaux
  const [configuration, setConfiguration] = useState<TontineConfiguration | null>(null);
  const [tontineInfo, setTontineInfo] = useState<any>(null);
  const [validation, setValidation] = useState<ConfigurationValidation | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrderResponse | null>(null);
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  
  // État d'erreur
  const [error, setError] = useState<string | null>(null);

  // Charger la validation
  const loadValidation = async () => {
    try {
      const validationResult = await configurationService.validateConfiguration(tontineId);
      setValidation(validationResult);
    } catch (err) {
      // La validation peut échouer si la configuration n'existe pas encore
      setValidation(null);
    }
  };

  // Charger la configuration AVEC AUTO-CRÉATION
  const loadConfiguration = async () => {
    if (!tontineId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Chargement configuration pour tontine:', tontineId);
      
      // 1. Essayer de récupérer la configuration existante
      const response: ConfigurationResponse = await configurationService.getConfiguration(tontineId);
      setConfiguration(response.configuration);
      setTontineInfo(response.tontineInfo);
      console.log('✅ Configuration chargée:', response);
      
      // Charger automatiquement la validation
      await loadValidation();
      
    } catch (err: any) {
      console.log('❌ Erreur lors du chargement:', err.response?.status);
      
      // 2. Si configuration n'existe pas (404), la créer automatiquement
      if (err.response?.status === 404) {
        console.log('🔧 Configuration inexistante, création automatique...');
        
        try {
          // Configuration par défaut (structure correcte)
          const defaultConfigData: CreateConfigurationFormData = {
            paymentOrderType: 'random',
            penaltyAmount: 5000,
            gracePeriodDays: 3,
            maxMissedPayments: 2,
            interestRate: 0,
            customRules: []
          };
          
          console.log('📄 Création configuration par défaut:', defaultConfigData);
          
          // 3. Créer la configuration
          const success = await createConfiguration(defaultConfigData);
          if (success) {
            console.log('✅ Configuration créée et chargée automatiquement');
          } else {
            console.error('❌ Échec de la création automatique');
          }
          
        } catch (createError: any) {
          console.error('❌ Erreur création configuration:', createError);
          setError(createError.response?.data?.message || 'Erreur lors de la création de la configuration');
        }
      } else {
        // Autre erreur (pas 404)
        console.error('❌ Erreur API configuration:', err);
        setError(err.response?.data?.message || 'Erreur lors du chargement de la configuration');
      }
    } finally {
      setLoading(false);
    }
  };

  // Créer une configuration
  const createConfiguration = async (data: CreateConfigurationFormData): Promise<boolean> => {
    setCreating(true);
    setError(null);
    
    try {
      const response = await configurationService.createConfiguration(tontineId, data);
      setConfiguration(response.configuration);
      setTontineInfo(response.tontineInfo);
      await loadValidation();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la configuration');
      return false;
    } finally {
      setCreating(false);
    }
  };

  // Mettre à jour l'ordre de paiement
  const updatePaymentOrder = async (data: UpdatePaymentOrderFormData): Promise<boolean> => {
    setUpdating(true);
    setError(null);
    
    try {
      const response = await configurationService.updatePaymentOrder(tontineId, data);
      setPaymentOrder(response);
      
      // Recharger la configuration complète
      await loadConfiguration();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour de l\'ordre');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Mettre à jour les règles finales
  const updateFinalRules = async (rules: any): Promise<boolean> => {
    setUpdating(true);
    setError(null);
    
    try {
      const updatedConfig = await configurationService.updateFinalRules(tontineId, rules);
      setConfiguration(updatedConfig);
      await loadValidation();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour des règles');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Accord d'un membre
  const memberAgreement = async (
    memberId: string, 
    data: MemberAgreementFormData
  ): Promise<boolean> => {
    setUpdating(true);
    setError(null);
    
    try {
      const updatedConfig = await configurationService.memberAgreement(tontineId, memberId, data);
      setConfiguration(updatedConfig);
      await loadValidation();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement de l\'accord');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Finaliser la configuration
  const finalizeConfiguration = async (): Promise<boolean> => {
    setFinalizing(true);
    setError(null);
    
    try {
      const finalizedConfig = await configurationService.finalizeConfiguration(tontineId);
      setConfiguration(finalizedConfig);
      await loadValidation();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la finalisation');
      return false;
    } finally {
      setFinalizing(false);
    }
  };

  // Valider la configuration
  const validateConfiguration = async () => {
    await loadValidation();
  };

  // Calculer les permissions et l'état
  const canModify = configuration && userId ? 
    configurationService.canUserModifyConfiguration(configuration, userId) : false;
    
  const canFinalize = configuration && validation && userId ?
    configurationService.canUserFinalizeConfiguration(configuration, userId, validation) : false;

  const progress = configuration ? 
    configurationService.calculateProgress(configuration) : 
    { percentage: 0, agreedCount: 0, totalCount: 0, remainingCount: 0 };

  const statusMessage = configuration ? 
    configurationService.getStatusMessage(configuration) : '';

  // Charger automatiquement au montage
  useEffect(() => {
    if (tontineId) {
      loadConfiguration();
    }
  }, [tontineId]);

  return {
    // État
    configuration,
    tontineInfo,
    validation,
    paymentOrder,
    
    // États de chargement
    loading,
    creating,
    updating,
    finalizing,
    
    // État d'erreur
    error,
    
    // Actions
    loadConfiguration,
    createConfiguration,
    updatePaymentOrder,
    updateFinalRules,
    memberAgreement,
    finalizeConfiguration,
    validateConfiguration,
    
    // Utilitaires
    canModify,
    canFinalize,
    progress,
    statusMessage
  };
};