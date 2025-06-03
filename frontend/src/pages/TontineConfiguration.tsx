// frontend/src/pages/TontineConfiguration.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  Shuffle,
  Trophy,
  DollarSign,
  Save,
  Check,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { useConfiguration } from '../hooks/useConfiguration';
import { useAuth } from '../hooks/useAuth';
import { 
  PaymentOrderType, 
  PAYMENT_ORDER_OPTIONS,
  type CreateConfigurationFormData,
  type UpdatePaymentOrderFormData 
} from '../types/configuration';

const TontineConfiguration: React.FC = () => {
  const { id: tontineId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    configuration,
    tontineInfo,
    validation,
    loading,
    creating,
    updating,
    finalizing,
    error,
    canModify,
    canFinalize,
    progress,
    statusMessage,
    createConfiguration,
    updatePaymentOrder,
    memberAgreement,
    finalizeConfiguration,    
  } = useConfiguration(tontineId!, user?.id);

  // États locaux
  const [currentStep, setCurrentStep] = useState<'setup' | 'order' | 'rules' | 'agreements' | 'finalize'>('setup');
  const [showRulesDetails, setShowRulesDetails] = useState(false);
  const [selectedOrderType, setSelectedOrderType] = useState<PaymentOrderType>(PaymentOrderType.SENIORITY);
  const [manualOrder, setManualOrder] = useState<string[]>([]);
  const [rules, setRules] = useState({
    penaltyAmount: 5000,
    gracePeriodDays: 3,
    maxMissedPayments: 2,
    interestRate: 0,
    customRules: [] as string[]
  });

  // Charger la configuration existante
  useEffect(() => {
    if (configuration) {
      setSelectedOrderType(configuration.paymentOrder.type);
      setManualOrder(configuration.paymentOrder.order);
      setRules({
        penaltyAmount: configuration.finalRules.penaltyAmount,
        gracePeriodDays: configuration.finalRules.gracePeriodDays,
        maxMissedPayments: configuration.finalRules.maxMissedPayments,
        interestRate: configuration.finalRules.interestRate || 0,
        customRules: configuration.finalRules.customRules || []
     });
      
      // Déterminer l'étape actuelle basée sur le statut
      if (configuration.status === 'pending') {
        setCurrentStep('agreements');
      } else if (configuration.status === 'awaiting_approval') {
        setCurrentStep('finalize');
      } else if (configuration.status === 'completed') {
        setCurrentStep('finalize');
      } else {
        setCurrentStep('setup');
      }
    }
  }, [configuration]);

  // Simuler des membres pour l'affichage (à remplacer par vraies données)
  const mockMembers = [
    { id: 'member1', name: 'Alice Dupont', phone: '+24101234567', reputation: 85, joinedAt: new Date() },
    { id: 'member2', name: 'Bob Martin', phone: '+24101234568', reputation: 75, joinedAt: new Date() },
    { id: 'member3', name: 'Claire Dubois', phone: '+24101234569', reputation: 90, joinedAt: new Date() }
  ];

  // Créer une nouvelle configuration
  const handleCreateConfiguration = async () => {
    const formData: CreateConfigurationFormData = {
      paymentOrderType: selectedOrderType,
      penaltyAmount: rules.penaltyAmount,
      gracePeriodDays: rules.gracePeriodDays,
      maxMissedPayments: rules.maxMissedPayments,
      interestRate: rules.interestRate,
      customRules: rules.customRules,
      manualOrder: selectedOrderType === PaymentOrderType.MANUAL ? manualOrder : undefined
    };

    const success = await createConfiguration(formData);
    if (success) {
      setCurrentStep('agreements');
    }
  };

  // Mettre à jour l'ordre de paiement
  const handleUpdateOrder = async () => {
    const updateData: UpdatePaymentOrderFormData = {
      type: selectedOrderType,
      manualOrder: selectedOrderType === PaymentOrderType.MANUAL ? manualOrder : undefined
    };

    const success = await updatePaymentOrder(updateData);
    if (success) {
      setCurrentStep('agreements');
    }
  };

  // Accord d'un membre (simulation)
  const handleMemberAgreement = async (memberId: string, agree: boolean) => {
    await memberAgreement(memberId, { hasAgreed: agree });
  };

  // Finaliser la configuration
  const handleFinalize = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir finaliser cette configuration ? Cette action est irréversible.')) {
      const success = await finalizeConfiguration();
      if (success) {
        navigate(`/tontines/${tontineId}/dashboard`);
      }
    }
  };

  // Générer l'ordre selon le type
  const generateOrder = (type: PaymentOrderType) => {
    switch (type) {
      case PaymentOrderType.RANDOM:
        return [...mockMembers.map(m => m.id)].sort(() => Math.random() - 0.5);
      case PaymentOrderType.SENIORITY:
        return mockMembers
          .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime())
          .map(m => m.id);
      case PaymentOrderType.REPUTATION:
        return mockMembers
          .sort((a, b) => b.reputation - a.reputation)
          .map(m => m.id);
      default:
        return manualOrder;
    }
  };

  // Déplacer un membre dans l'ordre manuel
  const moveMember = (fromIndex: number, toIndex: number) => {
    const newOrder = [...manualOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setManualOrder(newOrder);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(`/tontines/${tontineId}/enrollment`)}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            <Settings className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configuration</h1>
              <p className="text-gray-600">{tontineInfo?.name}</p>
            </div>
          </div>

          {/* Statut et progression */}
          {configuration && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    configuration.status === 'completed' ? 'bg-green-500' :
                    configuration.status === 'awaiting_approval' ? 'bg-blue-500' :
                    'bg-orange-500'
                  }`}></div>
                  <span className="font-medium">{statusMessage}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {progress.agreedCount}/{progress.totalCount} membres d'accord
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation par étapes */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
            {[
              { id: 'setup', label: 'Configuration', icon: Settings },
              { id: 'agreements', label: 'Accords', icon: Users },
              { id: 'finalize', label: 'Finalisation', icon: CheckCircle }
            ].map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setCurrentStep(step.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentStep === step.id 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                  {step.label}
                </button>
                {index < 2 && <ArrowRight className="w-4 h-4 text-gray-400" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-4xl mx-auto">
          {/* Étape 1: Configuration */}
          {currentStep === 'setup' && (
            <div className="space-y-6">
              {/* Ordre de paiement */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Shuffle className="w-5 h-5 text-blue-500" />
                  Ordre de paiement
                </h2>
                
                <div className="grid gap-4 mb-6">
                  {PAYMENT_ORDER_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="orderType"
                        value={option.value}
                        checked={selectedOrderType === option.value}
                        onChange={(e) => setSelectedOrderType(e.target.value as PaymentOrderType)}
                        className="w-4 h-4 text-blue-500"
                      />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Ordre manuel */}
                {selectedOrderType === PaymentOrderType.MANUAL && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Définir l'ordre manuellement</h3>
                    <div className="space-y-2">
                      {manualOrder.map((memberId, index) => {
                        const member = mockMembers.find(m => m.id === memberId);
                        return member ? (
                          <div key={memberId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-gray-600">{member.phone}</div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => index > 0 && moveMember(index, index - 1)}
                                disabled={index === 0}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => index < manualOrder.length - 1 && moveMember(index, index + 1)}
                                disabled={index === manualOrder.length - 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Aperçu de l'ordre */}
                {selectedOrderType !== PaymentOrderType.MANUAL && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Aperçu de l'ordre</h3>
                    <div className="space-y-2">
                      {generateOrder(selectedOrderType).map((memberId, index) => {
                        const member = mockMembers.find(m => m.id === memberId);
                        return member ? (
                          <div key={memberId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-gray-600">{member.phone}</div>
                            </div>
                            {selectedOrderType === PaymentOrderType.REPUTATION && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Trophy className="w-4 h-4" />
                                {member.reputation}
                              </div>
                            )}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Règles finales */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Règles finales
                  </h2>
                  <button
                    onClick={() => setShowRulesDetails(!showRulesDetails)}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                  >
                    {showRulesDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showRulesDetails ? 'Masquer' : 'Détails'}
                  </button>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant de pénalité (FCFA)
                    </label>
                    <input
                      type="number"
                      value={rules.penaltyAmount}
                      onChange={(e) => setRules({...rules, penaltyAmount: Number(e.target.value)})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={!canModify}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Période de grâce (jours)
                    </label>
                    <input
                      type="number"
                      value={rules.gracePeriodDays}
                      onChange={(e) => setRules({...rules, gracePeriodDays: Number(e.target.value)})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={!canModify}
                    />
                  </div>

                  {showRulesDetails && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Paiements manqués maximum
                        </label>
                        <input
                          type="number"
                          value={rules.maxMissedPayments}
                          onChange={(e) => setRules({...rules, maxMissedPayments: Number(e.target.value)})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={!canModify}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Taux d'intérêt (%) - Optionnel
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={rules.interestRate}
                          onChange={(e) => setRules({...rules, interestRate: Number(e.target.value)})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={!canModify}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                {!configuration ? (
                  <button
                    onClick={handleCreateConfiguration}
                    disabled={creating}
                    className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Création...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Créer la configuration
                      </>
                    )}
                  </button>
                ) : canModify && (
                  <button
                    onClick={handleUpdateOrder}
                    disabled={updating}
                    className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Mettre à jour
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Étape 2: Accords des membres */}
          {currentStep === 'agreements' && configuration && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Accords des membres
              </h2>

              <div className="space-y-4">
                {configuration.memberAgreements.map((agreement) => (
                  <div key={agreement.memberId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        agreement.hasAgreed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {agreement.hasAgreed ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-medium">{agreement.memberName}</div>
                        <div className="text-sm text-gray-600">{agreement.memberPhone}</div>
                        {agreement.hasAgreed && agreement.agreedAt && (
                          <div className="text-xs text-green-600">
                            Accepté le {new Date(agreement.agreedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!agreement.hasAgreed && (
                        <>
                          <button
                            onClick={() => handleMemberAgreement(agreement.memberId, true)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            Simuler accord
                          </button>
                          <button
                            onClick={() => handleMemberAgreement(agreement.memberId, false)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Refuser
                          </button>
                        </>
                      )}
                      {agreement.hasAgreed && (
                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                          Accepté
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Erreurs de validation */}
              {validation && validation.errors.length > 0 && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-red-700">Problèmes à résoudre</span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Étape 3: Finalisation */}
          {currentStep === 'finalize' && configuration && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Finalisation
              </h2>

              <div className="space-y-6">
                {/* Résumé */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-green-700">Configuration prête</span>
                  </div>
                  <p className="text-sm text-green-600">
                    Tous les membres ont accepté la configuration. Vous pouvez maintenant finaliser et activer la tontine.
                  </p>
                </div>

                {/* Détails de l'ordre final */}
                <div>
                  <h3 className="font-medium mb-3">Ordre de paiement final</h3>
                  <div className="space-y-2">
                    {configuration.paymentOrder.order.map((memberId, index) => {
                      const agreement = configuration.memberAgreements.find(a => a.memberId === memberId);
                      return agreement ? (
                        <div key={memberId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <div className="font-medium">{agreement.memberName}</div>
                            <div className="text-sm text-gray-600">{agreement.memberPhone}</div>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Action de finalisation */}
                {configuration.status !== 'completed' && canFinalize && (
                  <button
                    onClick={handleFinalize}
                    disabled={finalizing}
                    className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {finalizing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Finalisation...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Finaliser et activer la tontine
                      </>
                    )}
                  </button>
                )}

                {configuration.status === 'completed' && (
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-green-700 mb-2">Configuration terminée !</h3>
                    <p className="text-green-600 mb-4">La tontine est maintenant active.</p>
                    <button
                      onClick={() => navigate(`/tontines/${tontineId}/dashboard`)}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                    >
                      Accéder au tableau de bord
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Erreur globale */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Erreur</span>
            </div>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TontineConfiguration; 
