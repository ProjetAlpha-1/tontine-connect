import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Smartphone } from 'lucide-react';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container-app">
      <div className="min-h-screen flex flex-col justify-center px-6 py-12">
        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <div className="w-48 h-48 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-2xl">
            <Users size={80} className="text-white" />
          </div>
        </div>

        {/* Contenu */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bienvenue à<br />
            <span className="text-primary-600">TontineConnect</span>
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Rejoignez une communauté de confiance pour
            épargner et prospérer ensemble.
          </p>

          <p className="text-base text-gray-500 mb-8">
            TontineConnect simplifie et sécurise la gestion
            de vos tontines.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-12">
          <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-2xl">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Sécurisé</h3>
              <p className="text-sm text-gray-600">Système de réputation et transparence totale</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-2xl">
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Simple</h3>
              <p className="text-sm text-gray-600">Interface mobile intuitive et paiements faciles</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/auth')}
          className="btn-primary w-full text-lg py-4 mb-4"
        >
          Commencer
        </button>

        <p className="text-center text-sm text-gray-500">
          🇬🇦 Conçu pour le marché gabonais
        </p>
      </div>
    </div>
  );
}; 
