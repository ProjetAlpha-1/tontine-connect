// src/pages/CreateTontine.tsx
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  Calendar,
  Wallet,
  Info,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

// Schema de validation simplifié pour l'étape 1 uniquement
const createTontineSchema = yup.object({
  name: yup.string()
    .required('Le nom de la tontine est requis')
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),

  description: yup.string()
    .required('La description est requise')
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(500, 'La description ne peut pas dépasser 500 caractères'),

  objective: yup.string()
    .required('L\'objectif est requis')
    .min(5, 'L\'objectif doit contenir au moins 5 caractères')
    .max(200, 'L\'objectif ne peut pas dépasser 200 caractères'),

  contributionAmount: yup.number()
    .required('Le montant de contribution est requis')
    .min(5000, 'Le montant minimum est de 5,000 XAF')
    .max(1000000, 'Le montant maximum est de 1,000,000 XAF'),

  frequency: yup.string()
    .required('La fréquence est requise')
    .oneOf(['weekly', 'biweekly', 'monthly'], 'Fréquence invalide'),

  maxParticipants: yup.number()
    .required('Le nombre maximum de participants est requis')
    .min(3, 'Minimum 3 participants')
    .max(50, 'Maximum 50 participants'),

  minParticipants: yup.number()
    .required('Le nombre minimum de participants est requis')
    .min(3, 'Minimum 3 participants'),

  enrollmentDeadline: yup.date()
    .required('La date limite d\'inscription est requise')
    .min(new Date(), 'La date doit être dans le futur'),

  plannedStartDate: yup.date()
    .required('La date de début prévue est requise')
    .min(yup.ref('enrollmentDeadline'), 'La date de début doit être après la date limite d\'inscription'),

  // Règles de la tontine
  gracePeriodDays: yup.number()
    .required('La période de grâce est requise')
    .min(0, 'Minimum 0 jour')
    .max(30, 'Maximum 30 jours'),

  penaltyAmount: yup.number()
    .min(0, 'Le montant de pénalité ne peut pas être négatif')
    .max(yup.ref('contributionAmount'), 'La pénalité ne peut pas dépasser la contribution'),

  orderDeterminationMethod: yup.string()
    .required('La méthode de détermination de l\'ordre est requise')
    .oneOf(['random', 'manual', 'auction'], 'Méthode invalide'),

  allowEarlyWithdrawal: yup.boolean()
})

interface CreateTontineFormData {
  name: string
  description: string
  objective: string
  contributionAmount: number
  frequency: 'weekly' | 'biweekly' | 'monthly'
  maxParticipants: number
  minParticipants: number
  enrollmentDeadline: Date
  plannedStartDate: Date
  gracePeriodDays: number
  penaltyAmount: number
  orderDeterminationMethod: 'random' | 'manual' | 'auction'
  allowEarlyWithdrawal: boolean
}

interface CreateTontineProps {
  onBack: () => void
}

const CreateTontine: React.FC<CreateTontineProps> = ({ onBack }) => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateTontineFormData>({
    resolver: yupResolver(createTontineSchema),
    defaultValues: {
      name: '',
      description: '',
      objective: '',
      contributionAmount: 25000,
      frequency: 'monthly',
      maxParticipants: 8,
      minParticipants: 3,
      enrollmentDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
      plannedStartDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 jours
      gracePeriodDays: 3,
      penaltyAmount: 0,
      orderDeterminationMethod: 'random',
      allowEarlyWithdrawal: false
    }
  })

  const watchedValues = form.watch()

  // Calculer les statistiques prévisionnelles
  const calculateStats = () => {
    const { contributionAmount, maxParticipants, frequency } = watchedValues
    const periodsPerMonth = frequency === 'weekly' ? 4 : frequency === 'biweekly' ? 2 : 1
    const totalPeriods = maxParticipants // Un tour par participant
    const totalAmountPerCycle = contributionAmount * maxParticipants
    const potentialTotalAmount = totalAmountPerCycle * totalPeriods

    return {
      totalAmountPerCycle,
      potentialTotalAmount,
      totalPeriods,
      periodsPerMonth,
      estimatedDurationMonths: Math.ceil(totalPeriods / periodsPerMonth)
    }
  }

  const stats = calculateStats()

  // Formatage des montants
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Soumission du formulaire - Création uniquement
  const onSubmit = async (data: CreateTontineFormData) => {
    console.log('🔥 onSubmit appelé avec:', data)
    setIsSubmitting(true)
    
    try {
      // Préparer les données selon le modèle backend
      const tontineData = {
        name: data.name,
        description: data.description,
        objective: data.objective,
        contributionAmount: data.contributionAmount,
        frequency: data.frequency,
        maxParticipants: data.maxParticipants,
        minParticipants: data.minParticipants,
        enrollmentDeadline: data.enrollmentDeadline.toISOString(),
        plannedStartDate: data.plannedStartDate.toISOString(),
        rules: {
          gracePeriodDays: data.gracePeriodDays,
          penaltyAmount: data.penaltyAmount,
          orderDeterminationMethod: data.orderDeterminationMethod,
          allowEarlyWithdrawal: data.allowEarlyWithdrawal,
          minimumReputationScore: 1 // Valeur par défaut
        }
      }

      console.log('Création de la tontine:', tontineData)

      // Appel API réel vers le backend
      const response = await fetch('http://localhost:3001/api/v1/tontines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Décommentez quand l'auth sera connectée
          // 'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify(tontineData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la création de la tontine')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la création de la tontine')
      }

      const newTontine = result.data

      // Redirection vers la page d'enrollment
      navigate(`/tontines/${newTontine.id}/enrollment`)

    } catch (error) {
      console.error('Erreur création tontine:', error)
      // Afficher une alerte avec le message d'erreur du backend
      alert(`Erreur lors de la création de la tontine: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour au dashboard
            </button>
            <div className="text-sm text-gray-500">
              Étape 1/4 : Création de la tontine
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête de la page */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Créer une nouvelle tontine
          </h1>
          <p className="text-lg text-gray-600">
            Définissez les paramètres de base de votre tontine
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale : Formulaire */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Section : Informations générales */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  Informations générales
                </h2>

                <div className="space-y-6">
                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la tontine *
                    </label>
                    <input
                      {...form.register('name')}
                      type="text"
                      placeholder="Ex: Tontine des Entrepreneurs"
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
                      placeholder="Décrivez votre tontine, son contexte, ses membres cibles..."
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Objectif */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Objectif principal *
                    </label>
                    <input
                      {...form.register('objective')}
                      type="text"
                      placeholder="Ex: Financement de projets d'entreprise"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.objective && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.objective.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section : Configuration financière */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Wallet className="w-5 h-5 mr-2 text-green-600" />
                  Configuration financière
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Montant de contribution */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant de contribution *
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
                      <option value="biweekly">Bimensuelle</option>
                      <option value="weekly">Hebdomadaire</option>
                    </select>
                  </div>

                  {/* Pénalité */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pénalité de retard (optionnel)
                    </label>
                    <div className="relative">
                      <input
                        {...form.register('penaltyAmount', { valueAsNumber: true })}
                        type="number"
                        step="500"
                        min="0"
                        className="block w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <span className="text-gray-500 text-sm">XAF</span>
                      </div>
                    </div>
                    {form.formState.errors.penaltyAmount && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.penaltyAmount.message}
                      </p>
                    )}
                  </div>

                  {/* Période de grâce */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Période de grâce (jours) *
                    </label>
                    <input
                      {...form.register('gracePeriodDays', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      max="30"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.gracePeriodDays && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.gracePeriodDays.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section : Participants et calendrier */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Participants et calendrier
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Participants minimum */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Participants minimum *
                    </label>
                    <input
                      {...form.register('minParticipants', { valueAsNumber: true })}
                      type="number"
                      min="3"
                      max="50"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.minParticipants && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.minParticipants.message}
                      </p>
                    )}
                  </div>

                  {/* Participants maximum */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Participants maximum *
                    </label>
                    <input
                      {...form.register('maxParticipants', { valueAsNumber: true })}
                      type="number"
                      min="3"
                      max="50"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.maxParticipants && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.maxParticipants.message}
                      </p>
                    )}
                  </div>

                  {/* Date limite d'inscription */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date limite d'inscription *
                    </label>
                    <input
                      {...form.register('enrollmentDeadline', { valueAsDate: true })}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.enrollmentDeadline && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.enrollmentDeadline.message}
                      </p>
                    )}
                  </div>

                  {/* Date de début prévue */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début prévue *
                    </label>
                    <input
                      {...form.register('plannedStartDate', { valueAsDate: true })}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.plannedStartDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.plannedStartDate.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section : Règles et configuration */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                  Règles et configuration
                </h2>

                <div className="space-y-6">
                  {/* Méthode de détermination de l'ordre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Méthode de détermination de l'ordre *
                    </label>
                    <select
                      {...form.register('orderDeterminationMethod')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="random">Tirage au sort automatique</option>
                      <option value="manual">Attribution manuelle</option>
                      <option value="auction">Système d'enchères</option>
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      Vous pourrez configurer cette méthode après l'inscription des membres
                    </p>
                  </div>

                  {/* Retrait anticipé */}
                  <div className="flex items-center">
                    <input
                      {...form.register('allowEarlyWithdrawal')}
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Autoriser le retrait anticipé avec pénalités
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne latérale : Aperçu */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Aperçu en temps réel
                </h3>

                <div className="space-y-4">
                  {/* Nom et objectif */}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {watchedValues.name || 'Nom de la tontine'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {watchedValues.objective || 'Objectif de la tontine'}
                    </p>
                  </div>

                  {/* Statistiques clés */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Contribution :</span>
                      <span className="font-medium">{formatCurrency(watchedValues.contributionAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fréquence :</span>
                      <span className="font-medium">
                        {watchedValues.frequency === 'weekly' ? 'Hebdomadaire' : 
                         watchedValues.frequency === 'biweekly' ? 'Bimensuelle' : 'Mensuelle'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Participants :</span>
                      <span className="font-medium">
                        {watchedValues.minParticipants || 0} - {watchedValues.maxParticipants || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Durée estimée :</span>
                      <span className="font-medium">{stats.estimatedDurationMonths} mois</span>
                    </div>
                  </div>

                  {/* Projections financières */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-2">Projections</h5>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div className="flex justify-between">
                        <span>Par cycle :</span>
                        <span className="font-medium">{formatCurrency(stats.totalAmountPerCycle)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total potentiel :</span>
                        <span className="font-medium">{formatCurrency(stats.potentialTotalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nombre de tours :</span>
                        <span className="font-medium">{stats.totalPeriods}</span>
                      </div>
                    </div>
                  </div>

                  {/* Prochaines étapes */}
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-900 mb-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Prochaines étapes
                    </h5>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Inviter les membres</li>
                      <li>• Configurer l'ordre</li>
                      <li>• Démarrer la tontine</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-between bg-white rounded-lg shadow-md p-6">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Annuler
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-8 py-3 bg-blue-600 border border-transparent rounded-lg text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  Créer et inviter des membres
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