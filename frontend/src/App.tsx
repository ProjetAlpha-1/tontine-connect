// src/App.tsx
import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { authService } from './services/authService'
import Dashboard from './pages/Dashboard'
import CreateTontine from './pages/CreateTontine'
import TontineEnrollment from './pages/TontineEnrollment' 


// Composant wrapper pour l'authentification
const AuthenticatedApp: React.FC = () => {
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Récupérer les données utilisateur depuis le localStorage
  useEffect(() => {
    const token = localStorage.getItem('auth-token')
    if (token) {
      // TODO: Récupérer les vraies données utilisateur
      setUser({ phone: '+241 XX XX XX XX' })
    }
  }, [])

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('auth-token')
    navigate('/login')
    window.location.reload() // Force la réinitialisation de l'app
  }

  // Navigation vers création de tontine
  const handleCreateTontine = () => {
    navigate('/tontines/create')
  }

  // Fonction appelée quand une tontine est créée avec succès
  const handleTontineCreated = (newTontine: any) => {
    console.log('Nouvelle tontine créée:', newTontine)
    // TODO: Ajouter la tontine à la liste ou faire autre chose
    // Pour l'instant, on redirige vers le dashboard
    navigate('/dashboard')
  }

  // Fonction pour retour au dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  // Déterminer le titre de la page pour le breadcrumb
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/tontines/create':
        return 'Créer une tontine'
      case '/dashboard':
        return 'Dashboard'
      default:
        if (location.pathname.includes('/enrollment')) {
          return 'Invitation des membres'
        }
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200"
              >
                🏛️ Tontine Connect
              </button>
              {location.pathname !== '/dashboard' && (
                <span className="ml-4 text-gray-500">
                  / {getPageTitle()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                📱 {user?.phone || 'Utilisateur connecté'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Routes principales */}
      <Routes>
        <Route 
          path="/dashboard" 
          element={<Dashboard onCreateTontine={handleCreateTontine} />} 
        />
        <Route 
          path="/tontines/create" 
          element={
            <CreateTontine 
              onBack={handleBackToDashboard}
              onSuccess={handleTontineCreated}
            />
          } 
        />
        <Route 
          path="/tontines/:id/enrollment" 
          element={<TontineEnrollment />} 
        />
        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {/* Route 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

// Composant d'authentification (votre code existant)
const LoginForm: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  // États pour l'authentification
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Envoyer OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) {
      setError('Veuillez saisir votre numéro de téléphone')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await authService.sendOTP(phone)
      setSuccess('Code OTP envoyé par SMS!')
      setStep('otp')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Vérifier OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim() || otp.length !== 6) {
      setError('Veuillez saisir le code à 6 chiffres')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const result = await authService.verifyOTP(phone, otp)

      // Sauvegarder le token
      localStorage.setItem('auth-token', result.token)

      setSuccess('Connexion réussie!')
      onLoginSuccess()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            📱
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tontine Connect
          </h1>
          <p className="text-gray-600">
            {step === 'phone'
              ? 'Connectez-vous avec votre numéro de téléphone'
              : 'Saisissez le code reçu par SMS'
            }
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Messages d'erreur/succès */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {step === 'phone' ? (
            /* Formulaire téléphone */
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+241 XX XX XX XX"
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </span>
                ) : (
                  'Envoyer le code SMS'
                )}
              </button>
            </form>
          ) : (
            /* Formulaire OTP */
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de vérification
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center tracking-widest"
                  disabled={isSubmitting}
                />
                <p className="mt-2 text-sm text-gray-600">
                  Code envoyé au {phone}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors duration-200"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Vérification...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone')
                  setOtp('')
                  setError('')
                  setSuccess('')
                }}
                className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                disabled={isSubmitting}
              >
                ← Changer de numéro
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          Sécurisé par Tontine Connect • Gabon 🇬🇦
        </div>
      </div>
    </div>
  )
}

// Composant principal App avec gestion d'authentification
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth-token')
      if (token) {
        try {
          const userData = await authService.validateToken(token)
          setIsAuthenticated(true)
        } catch (error) {
          localStorage.removeItem('auth-token')
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Gérer la connexion réussie
  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  // Loading initial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Router>
      {isAuthenticated ? (
        <AuthenticatedApp />
      ) : (
        <Routes>
          <Route 
            path="*" 
            element={<LoginForm onLoginSuccess={handleLoginSuccess} />} 
          />
        </Routes>
      )}
    </Router>
  )
}

export default App