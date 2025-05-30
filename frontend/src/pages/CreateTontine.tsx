// src/pages/CreateTontine.tsx
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Wallet,
  Info,
  Plus,
  Trash2,
  Eye,
  CheckCircle
} from 'lucide-react'

// Schema de validation
const createTontineSchema = yup.object({
  name: yup.string()
    .required('Le nom de la tontine est requis')
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  
  description: yup.string()
    .required('La description est requise')
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(200, 'La description ne peut pas dépasser 200 caractères'),
  
  contributionAmount: yup.number()
    .required('Le montant de contribution est requis')
    .min(5000, 'Le montant minimum est de 5,000 XAF')
    .max(1000000, 'Le montant maximum est de 1,000,000 XAF'),
  
  frequency: yup.string()
    .required('La fréquence est requise')
    .oneOf(['weekly', 'monthly'], 'Fréquence invalide'),
  
  maxMembers: yup.number()
    .required('Le nombre maximum de membres est requis')
    .min(3, 'Minimum 3 membres')
    .max(50, 'Maximum 50 membres'),
  
  duration: yup.number()
    .required('La durée est requise')
    .min(1, 'Durée minimum 1 mois')
    .max(24, 'Durée maximum 24 mois'),
  
  startDate: yup.date()
    .required('La date de début est requise')
    .min(new Date(), 'La date de début doit être dans le futur'),
})

interface CreateTontineFormData {
  name: string
  description: string
  contributionAmount: number
  frequency: 'weekly' | 'monthly'
  maxMembers: number
  duration: number
  startDate: Date
  inviteMembers: string[]
}

interface CreateTontineProps {
  onBack: () => void
  onSuccess?: (tontine: any) => void
}

const CreateTontine: React.FC<CreateTontineProps> = ({ onBack, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [invitePhones, setInvitePhones] = useState<string[]>([''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)

  const form = useForm<CreateTontineFormData>({
    resolver: yupResolver(createTontineSchema),
    defaultValues: {
      name: '',
      description: '',
      contributionAmount: 25000,
      frequency: 'monthly',
      maxMembers: 8,
      duration: 12,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
      inviteMembers: []
    }
  })

  const watchedValues = form.watch()

  // Calculer les statistiques prévisionnelles
  const calculateStats = () => {
    const { contributionAmount, maxMembers, frequency, duration } = watchedValues
    const periodsPerMonth = frequency === 'weekly' ? 4 : 1
    const totalPeriods = duration * periodsPerMonth
    const totalAmount = contributionAmount * maxMembers * totalPeriods
    const amountPerPerson = totalAmount / maxMembers

    return {
      totalAmount,
      amountPerPerson,
      totalPeriods,
      periodsPerMonth
    }
  }

  const stats = calculateStats()

  // Gestion des invitations
  const addInviteField = () => {
    setInvitePhones([...invitePhones, ''])
  }

  const removeInviteField = (index: number) => {
    setInvitePhones(invitePhones.filter((_, i) => i !== index))
  }

  const updateInvitePhone = (index: number, value: string) => {
    const newPhones = [...invitePhones]
    newPhones[index] = value
    setInvitePhones(newPhones)
  }

  // Formatage des montants
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Soumission du formulaire
  const onSubmit = async (data: CreateTontineFormData) => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
      if (currentStep === 2) {
        // Préparer les données pour la prévisualisation
        setPreviewData({
          ...data,
          inviteMembers: invitePhones.filter(phone => phone.trim() !== ''),
          stats: calculateStats()
        })
      }
      return
    }

    // Étape finale : création de la tontine
    setIsSubmitting(true)
    try {
      const tontineData = {
        ...data,
        inviteMembers: invitePhones.filter(phone => phone.trim() !== '')
      }

      // TODO: Appel API pour créer la tontine
      console.log('Création de la tontine:', tontineData)
      
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newTontine = {
        id: Date.now().toString(),
        ...tontineData,
        createdAt: new Date().toISOString(),
        status: 'pending',
        members: 1, // Le créateur
        currentAmount: 0
      }

      if (onSuccess) {
        onSuccess(newTontine)
      }
    } catch (error) {
      console.error('Erreur création tontine:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Interface des étapes
  const steps = [
    { number: 1, title: 'Informations de base', description: 'Nom, description et règles' },
    { number: 2, title: 'Invitations', description: 'Inviter des membres' },
    { number: 3, title: 'Confirmation', description: 'Vérifier et créer' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour au dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.number 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Étape 1: Informations de base */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                📋 Informations de base
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Colonne gauche : Formulaire */}
                <div className="space-y-6">
                  {/* Nom de la tontine */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la tontine *
                    </label>
                    <input
                      {...form.register('name')}
                      type="text"
                      placeholder="Ex: Tontine des Amis"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      {...form.register('description')}
                      rows={3}
                      placeholder="Décrivez l'objectif de cette tontine..."
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Montant de contribution */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant de contribution par période *
                    </label>
                    <div className="relative">
                      <input
                        {...form.register('contributionAmount', { valueAsNumber: true })}
                        type="number"
                        step="1000"
                        min="5000"
                        max="1000000"
                        className="block w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <span className="text-gray-500 text-sm">XAF</span>
                      </div>
                    </div>
                    {form.formState.errors.contributionAmount && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.contributionAmount.message}
                      </p>
                    )}
                  </div>

                  {/* Fréquence */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fréquence des contributions *
                    </label>
                    <select
                      {...form.register('frequency')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="monthly">Mensuelle</option>
                      <option value="weekly">Hebdomadaire</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Nombre maximum de membres */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Membres max *
                      </label>
                      <input
                        {...form.register('maxMembers', { valueAsNumber: true })}
                        type="number"
                        min="3"
                        max="50"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {form.formState.errors.maxMembers && (
                        <p className="mt-1 text-sm text-red-600">
                          {form.formState.errors.maxMembers.message}
                        </p>
                      )}
                    </div>

                    {/* Durée */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durée (mois) *
                      </label>
                      <input
                        {...form.register('duration', { valueAsNumber: true })}
                        type="number"
                        min="1"
                        max="24"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {form.formState.errors.duration && (
                        <p className="mt-1 text-sm text-red-600">
                          {form.formState.errors.duration.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date de début */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début *
                    </label>
                    <input
                      {...form.register('startDate', { valueAsDate: true })}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.startDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.startDate.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Colonne droite : Prévisualisation en temps réel */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Aperçu de votre tontine
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {watchedValues.name || 'Nom de la tontine'}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {watchedValues.description || 'Description de la tontine'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center">
                          <Wallet className="w-4 h-4 mr-2 text-blue-600" />
                          <div>
                            <div className="font-medium">{formatCurrency(watchedValues.contributionAmount || 0)}</div>
                            <div className="text-gray-500">par {watchedValues.frequency === 'weekly' ? 'semaine' : 'mois'}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-green-600" />
                          <div>
                            <div className="font-medium">{watchedValues.maxMembers || 0} membres</div>
                            <div className="text-gray-500">maximum</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                          <div>
                            <div className="font-medium">{watchedValues.duration || 0} mois</div>
                            <div className="text-gray-500">de durée</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Info className="w-4 h-4 mr-2 text-orange-600" />
                          <div>
                            <div className="font-medium">{stats.totalPeriods} tours</div>
                            <div className="text-gray-500">au total</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">Montants prévisionnels</h5>
                      <div className="space-y-1 text-sm text-blue-800">
                        <div className="flex justify-between">
                          <span>Total collecté :</span>
                          <span className="font-medium">{formatCurrency(stats.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reçu par personne :</span>
                          <span className="font-medium">{formatCurrency(stats.amountPerPerson)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Invitations */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                👥 Inviter des membres
              </h2>
              
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Invitations optionnelles</p>
                      <p>Vous pouvez inviter des membres maintenant ou plus tard. Les invitations seront envoyées par SMS après la création de la tontine.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Numéros de téléphone des membres à inviter
                </label>
                
                {invitePhones.map((phone, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => updateInvitePhone(index, e.target.value)}
                        placeholder="+241 XX XX XX XX"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {invitePhones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInviteField(index)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addInviteField}
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  disabled={invitePhones.length >= (watchedValues.maxMembers - 1)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un membre
                </button>
                
                <div className="text-sm text-gray-600">
                  Vous pouvez inviter jusqu'à {(watchedValues.maxMembers || 1) - 1} membres 
                  ({invitePhones.filter(p => p.trim()).length} invitations préparées)
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Confirmation */}
          {currentStep === 3 && previewData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ✅ Confirmation et création
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Résumé de la tontine */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Résumé de la tontine</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Nom :</span>
                        <div className="font-medium">{previewData.name}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Description :</span>
                        <div className="text-sm">{previewData.description}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-sm text-gray-600">Contribution :</span>
                          <div className="font-medium">{formatCurrency(previewData.contributionAmount)}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Fréquence :</span>
                          <div className="font-medium">
                            {previewData.frequency === 'weekly' ? 'Hebdomadaire' : 'Mensuelle'}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Membres max :</span>
                          <div className="font-medium">{previewData.maxMembers}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Durée :</span>
                          <div className="font-medium">{previewData.duration} mois</div>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Date de début :</span>
                        <div className="font-medium">
                          {new Date(previewData.startDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Invitations */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Invitations</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {previewData.inviteMembers.length > 0 ? (
                        <div>
                          <div className="text-sm text-gray-600 mb-2">
                            {previewData.inviteMembers.length} membre(s) seront invité(s) :
                          </div>
                          <ul className="space-y-1">
                            {previewData.inviteMembers.map((phone: string, index: number) => (
                              <li key={index} className="text-sm font-medium flex items-center">
                                <Users className="w-4 h-4 mr-2 text-green-600" />
                                {phone}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">
                          Aucune invitation préparée. Vous pourrez inviter des membres après la création.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistiques finales */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Prévisions financières</h3>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {formatCurrency(previewData.stats.totalAmount)}
                        </div>
                        <div className="text-sm text-gray-600">Montant total collecté</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-xl font-semibold text-green-600">
                            {formatCurrency(previewData.stats.amountPerPerson)}
                          </div>
                          <div className="text-xs text-gray-600">Par membre au final</div>
                        </div>
                        <div>
                          <div className="text-xl font-semibold text-purple-600">
                            {previewData.stats.totalPeriods}
                          </div>
                          <div className="text-xs text-gray-600">Tours de contributions</div>
                        </div>
                      </div>
                      
                      <div className="border-t border-blue-200 pt-4">
                        <div className="text-sm text-blue-800 space-y-1">
                          <div>• Chaque membre contribue {previewData.stats.totalPeriods} fois</div>
                          <div>• Un membre reçoit à chaque tour</div>
                          <div>• Rotation équitable garantie</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onBack()}
              className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep > 1 ? 'Étape précédente' : 'Annuler'}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-lg text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création en cours...
                </>
              ) : currentStep < 3 ? (
                <>
                  Étape suivante
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </>
              ) : (
                <>
                  Créer la tontine
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTontine