import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  Phone,
  Link2,
  QrCode,
  Check,
  X,
  Clock,
  Share2,
  Copy,
  Send,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Calendar
} from 'lucide-react'
import { 
  enrollmentService, 
  type TontineEnrollmentData
} from '../services/enrollmentService'

const TontineEnrollment: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  // États de la page
  const [tontine, setTontine] = useState<TontineEnrollmentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // États pour les invitations
  const [inviteMethod, setInviteMethod] = useState<'phone' | 'link' | 'qr'>('phone')
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([''])
  const [inviteMessage, setInviteMessage] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  // Charger les détails de la tontine
  useEffect(() => {
    const fetchTontineDetails = async () => {
      if (!id) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        // Appel API réel
        const tontineData = await enrollmentService.getTontineEnrollmentData(id)
        setTontine(tontineData)
        
        // Initialiser le message d'invitation
        setInviteMessage(
          `Rejoignez ma tontine "${tontineData.name}" sur Tontine Connect ! Lien: ${tontineData.invitationLink}`
        )
        
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement de la tontine')
        console.error('Erreur:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTontineDetails()
  }, [id])

  // Fonctions utilitaires
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  // Gestion des invitations par téléphone
  const addPhoneField = () => {
    setPhoneNumbers([...phoneNumbers, ''])
  }

  const removePhoneField = (index: number) => {
    setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index))
  }

  const updatePhoneNumber = (index: number, value: string) => {
    const newPhones = [...phoneNumbers]
    newPhones[index] = value
    setPhoneNumbers(newPhones)
  }

  // Envoyer les invitations par SMS
  const sendInvitations = async () => {
    if (!id) return
    
    setIsInviting(true)
    
    try {
      const validPhones = phoneNumbers.filter(phone => phone.trim())
      
      if (validPhones.length === 0) {
        alert('Veuillez saisir au moins un numéro de téléphone')
        return
      }

      // Appel API pour envoyer les invitations
      const result = await enrollmentService.inviteBatch(id, {
        phoneNumbers: validPhones,
        message: inviteMessage
      })
      
      if (result.success) {
        alert(`Invitations envoyées à ${result.sent} numéro(s)`)
        setPhoneNumbers(['']) // Reset le formulaire
        
        // Recharger les données pour voir les nouveaux membres
        const updatedTontine = await enrollmentService.getTontineEnrollmentData(id)
        setTontine(updatedTontine)
      } else {
        alert('Certaines invitations ont échoué. Vérifiez les numéros.')
      }
      
      if (result.errors.length > 0) {
        console.error('Erreurs d\'invitation:', result.errors)
      }
      
    } catch (error: any) {
      console.error('Erreur envoi invitations:', error)
      alert(error.message || 'Erreur lors de l\'envoi des invitations')
    } finally {
      setIsInviting(false)
    }
  }

  // Copier le lien d'invitation
  const copyInviteLink = async () => {
    if (!tontine) return
    
    try {
      await navigator.clipboard.writeText(tontine.invitationLink)
      alert('Lien copié dans le presse-papiers !')
    } catch (error) {
      console.error('Erreur copie:', error)
      // Fallback pour les navigateurs qui ne supportent pas clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = tontine.invitationLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Lien copié !')
    }
  }

  // Approuver/Rejeter une demande
  const handleParticipationAction = async (participationId: string, action: 'approve' | 'reject') => {
    if (!id) return
    
    try {
      const result = await enrollmentService.processMemberRequest(
        id, 
        participationId, 
        action,
        action === 'reject' ? 'Rejeté par le créateur' : undefined
      )
      
      if (result.success) {
        alert(result.message)
        
        // Recharger les données pour voir les changements
        const updatedTontine = await enrollmentService.getTontineEnrollmentData(id)
        setTontine(updatedTontine)
      }
      
    } catch (error: any) {
      console.error('Erreur action:', error)
      alert(error.message || 'Erreur lors du traitement de la demande')
    }
  }

  // Passer à l'étape suivante
  const proceedToConfiguration = () => {
    if (id) {
      navigate(`/tontines/${id}/configuration`)
    }
  }

  // Rafraîchir les données
  const refreshData = async () => {
    if (!id) return
    
    try {
      const updatedTontine = await enrollmentService.getTontineEnrollmentData(id)
      setTontine(updatedTontine)
    } catch (error: any) {
      console.error('Erreur refresh:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  if (error || !tontine) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error || 'Tontine introuvable'}</p>
          <div className="space-y-2">
            <button
              onClick={refreshData}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Réessayer
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Retour au dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const progressPercentage = (tontine.currentParticipants / tontine.minParticipants) * 100
  const canProceed = tontine.currentParticipants >= tontine.minParticipants

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour au dashboard
            </button>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Étape 2/4 : Invitation des membres
              </div>
              <button
                onClick={refreshData}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête de la page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inviter des membres
          </h1>
          <p className="text-lg text-gray-600">
            Invitez des membres à rejoindre "{tontine.name}"
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Détails de la tontine */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Détails de la tontine
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Nom :</span>
                  <div className="font-medium">{tontine.name}</div>
                </div>
                <div>
                  <span className="text-gray-600">Objectif :</span>
                  <div className="font-medium">{tontine.objective}</div>
                </div>
                <div>
                  <span className="text-gray-600">Contribution :</span>
                  <div className="font-medium">{formatCurrency(tontine.contributionAmount)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Fréquence :</span>
                  <div className="font-medium">
                    {tontine.frequency === 'weekly' ? 'Hebdomadaire' : 
                     tontine.frequency === 'biweekly' ? 'Bimensuelle' : 'Mensuelle'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Date limite d'inscription :</span>
                  <div className="font-medium">{formatDate(tontine.enrollmentDeadline)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Date de début prévue :</span>
                  <div className="font-medium">{formatDate(tontine.plannedStartDate)}</div>
                </div>
              </div>
            </div>

            {/* Interface d'invitation */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Inviter des membres
              </h2>

              {/* Méthodes d'invitation */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setInviteMethod('phone')}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    inviteMethod === 'phone' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  SMS
                </button>
                <button
                  onClick={() => setInviteMethod('link')}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    inviteMethod === 'link' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Lien
                </button>
                <button
                  onClick={() => setInviteMethod('qr')}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    inviteMethod === 'qr' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </button>
              </div>

              {/* Interface SMS */}
              {inviteMethod === 'phone' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Numéros de téléphone
                  </label>
                  {phoneNumbers.map((phone, index) => (
                    <div key={index} className="flex space-x-3">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => updatePhoneNumber(index, e.target.value)}
                        placeholder="+241 XX XX XX XX"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isInviting}
                      />
                      {phoneNumbers.length > 1 && (
                        <button
                          onClick={() => removePhoneField(index)}
                          className="text-red-600 hover:text-red-800 p-2"
                          disabled={isInviting}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    onClick={addPhoneField}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                    disabled={isInviting}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Ajouter un numéro
                  </button>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message personnalisé (optionnel)
                    </label>
                    <textarea
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Personnalisez votre message d'invitation..."
                      disabled={isInviting}
                    />
                  </div>

                  <button
                    onClick={sendInvitations}
                    disabled={isInviting || !phoneNumbers.some(p => p.trim())}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    {isInviting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer les invitations
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Interface Lien */}
              {inviteMethod === 'link' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Lien d'invitation
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={tontine.invitationLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <button
                      onClick={copyInviteLink}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copier
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Partagez ce lien pour permettre aux personnes de rejoindre votre tontine.
                  </p>
                </div>
              )}

              {/* Interface QR Code */}
              {inviteMethod === 'qr' && (
                <div className="text-center">
                  <div className="inline-block p-8 bg-gray-100 rounded-lg">
                    <QrCode className="w-32 h-32 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    QR Code d'invitation (bientôt disponible)
                  </p>
                </div>
              )}
            </div>

            {/* Liste des membres */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Membres ({tontine.currentParticipants}/{tontine.maxParticipants})
                </h2>
                <button
                  onClick={refreshData}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  🔄 Actualiser
                </button>
              </div>

              <div className="space-y-4">
                {tontine.participations.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun membre pour le moment</p>
                  </div>
                ) : (
                  tontine.participations.map((participation) => (
                    <div key={participation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          participation.status === 'joined' ? 'bg-green-500' :
                          participation.status === 'approved' ? 'bg-blue-500' :
                          participation.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <div className="font-medium">{participation.userName || 'Membre'}</div>
                          <div className="text-sm text-gray-600">{participation.userPhone}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {participation.status === 'joined' && (
                          <span className="text-green-600 text-sm font-medium">
                            Confirmé
                          </span>
                        )}
                        {participation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleParticipationAction(participation.id, 'approve')}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleParticipationAction(participation.id, 'reject')}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Progression
              </h3>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Participants</span>
                  <span>{tontine.currentParticipants}/{tontine.minParticipants} minimum</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  {canProceed ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                  )}
                  <span className="text-sm">
                    {canProceed 
                      ? 'Prêt pour la configuration'
                      : `${tontine.minParticipants - tontine.currentParticipants} membre(s) manquant(s)`
                    }
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-sm">
                    Limite: {formatDate(tontine.enrollmentDeadline)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={proceedToConfiguration}
                  disabled={!canProceed}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
                    canProceed
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canProceed ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Configurer l'ordre
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      En attente de membres
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Sauvegarder et continuer plus tard
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Conseils</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Invitez des personnes de confiance</li>
                  <li>• Vérifiez les numéros de téléphone</li>
                  <li>• Expliquez bien l'objectif de la tontine</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TontineEnrollment