// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react'
import { 
  PlusCircle, 
  Users, 
  Wallet, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface Tontine {
  id: string
  name: string
  description: string
  totalAmount: number
  currentAmount: number
  members: number
  maxMembers: number
  nextPaymentDate: string
  frequency: 'weekly' | 'monthly'
  status: 'active' | 'pending' | 'completed'
  isOwner: boolean
  reputation: number
}

interface DashboardStats {
  totalTontines: number
  activeTontines: number
  totalContributed: number
  nextPaymentAmount: number
  nextPaymentDate: string
  reputation: number
}

interface DashboardProps {
  onCreateTontine?: () => void
}

const Dashboard: React.FC<DashboardProps> = ({ onCreateTontine }) => {
  const [tontines, setTontines] = useState<Tontine[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalTontines: 0,
    activeTontines: 0,
    totalContributed: 0,
    nextPaymentAmount: 0,
    nextPaymentDate: '',
    reputation: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed'>('active')

  // Données de démonstration (en attendant l'API)
  useEffect(() => {
    // Simulation d'un appel API
    setTimeout(() => {
      const mockTontines: Tontine[] = [
        {
          id: '1',
          name: 'Tontine des Collègues',
          description: 'Épargne mensuelle entre collègues du bureau',
          totalAmount: 500000,
          currentAmount: 350000,
          members: 7,
          maxMembers: 10,
          nextPaymentDate: '2025-06-05',
          frequency: 'monthly',
          status: 'active',
          isOwner: true,
          reputation: 4.8
        },
        {
          id: '2',
          name: 'Groupe Famille Nguema',
          description: 'Tontine familiale pour les événements',
          totalAmount: 200000,
          currentAmount: 150000,
          members: 5,
          maxMembers: 8,
          nextPaymentDate: '2025-06-02',
          frequency: 'weekly',
          status: 'active',
          isOwner: false,
          reputation: 4.9
        },
        {
          id: '3',
          name: 'Investissement Immobilier',
          description: 'Épargne pour achat de terrain collectif',
          totalAmount: 2000000,
          currentAmount: 800000,
          members: 12,
          maxMembers: 15,
          nextPaymentDate: '2025-06-10',
          frequency: 'monthly',
          status: 'pending',
          isOwner: false,
          reputation: 4.6
        }
      ]

      const mockStats: DashboardStats = {
        totalTontines: 3,
        activeTontines: 2,
        totalContributed: 450000,
        nextPaymentAmount: 50000,
        nextPaymentDate: '2025-06-02',
        reputation: 4.8
      }

      setTontines(mockTontines)
      setStats(mockStats)
      setIsLoading(false)
    }, 1000)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <AlertCircle className="w-4 h-4" />
      case 'completed': return <Star className="w-4 h-4" />
      default: return null
    }
  }

  const filteredTontines = tontines.filter(tontine => tontine.status === activeTab)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec actions */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🏦 Mes Tontines
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Gérez vos épargnes collectives en toute sécurité
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
                <Users className="w-4 h-4 mr-2" />
                Rejoindre une tontine
              </button>
              <button 
                onClick={onCreateTontine}
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors duration-200"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Créer une tontine
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Wallet className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total contribué
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(stats.totalContributed)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tontines actives
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeTontines} / {stats.totalTontines}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Prochain paiement
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(stats.nextPaymentAmount)}
                    </dd>
                    <dd className="text-xs text-gray-500">
                      {formatDate(stats.nextPaymentDate)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Score de réputation
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.reputation}/5 ⭐
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets de filtrage */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {(['active', 'pending', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } transition-colors duration-200`}
                >
                  {tab === 'active' && 'Actives'}
                  {tab === 'pending' && 'En attente'}
                  {tab === 'completed' && 'Terminées'}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tontines.filter(t => t.status === tab).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Liste des tontines */}
          <div className="divide-y divide-gray-200">
            {filteredTontines.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">
                  Aucune tontine {activeTab === 'active' ? 'active' : activeTab === 'pending' ? 'en attente' : 'terminée'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'active' 
                    ? 'Créez votre première tontine ou rejoignez un groupe existant.'
                    : 'Aucune tontine dans cette catégorie pour le moment.'
                  }
                </p>
              </div>
            ) : (
              filteredTontines.map((tontine) => (
                <div key={tontine.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {tontine.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tontine.status)}`}>
                          {getStatusIcon(tontine.status)}
                          <span className="ml-1">
                            {tontine.status === 'active' && 'Active'}
                            {tontine.status === 'pending' && 'En attente'}
                            {tontine.status === 'completed' && 'Terminée'}
                          </span>
                        </span>
                        {tontine.isOwner && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            👑 Organisateur
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {tontine.description}
                      </p>
                      <div className="mt-3 flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {tontine.members}/{tontine.maxMembers} membres
                        </span>
                        <span className="flex items-center">
                          <Wallet className="w-4 h-4 mr-1" />
                          {formatCurrency(tontine.currentAmount)} / {formatCurrency(tontine.totalAmount)}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Prochain: {formatDate(tontine.nextPaymentDate)}
                        </span>
                        <span className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {tontine.reputation}/5
                        </span>
                      </div>
                      
                      {/* Barre de progression */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progression</span>
                          <span>{Math.round((tontine.currentAmount / tontine.totalAmount) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(tontine.currentAmount / tontine.totalAmount) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex-shrink-0">
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
                        Voir détails
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard