import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/');
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div style={{ maxWidth: '448px', margin: '0 auto', minHeight: '100vh', background: 'white' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: '#fed7aa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} style={{ color: '#ea580c' }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontWeight: 'bold' }}>Bonjour {user.name.split(' ')[0]} !</h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{user.phone}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ padding: '8px', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          <LogOut size={20} style={{ color: '#6b7280' }} />
        </button>
      </div>

      {/* Contenu */}
      <div style={{ padding: '24px' }}>
        {/* Profil */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '24px', border: '1px solid #f3f4f6' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Mon Profil de Confiance</h2>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ea580c', marginBottom: '8px' }}>
              {user.reputationScore}/100
            </div>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: '#f3f4f6', 
              color: '#374151', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '14px', 
              fontWeight: '600' 
            }}>
              {user.trustLevelInfo.icon} {user.trustLevelInfo.name}
            </div>
          </div>

          <div style={{ background: '#f3f4f6', borderRadius: '12px', height: '12px', marginBottom: '16px' }}>
            <div
              style={{ 
                background: 'linear-gradient(to right, #ea580c, #c2410c)', 
                height: '12px', 
                borderRadius: '12px',
                width: `${user.reputationScore}%`,
                transition: 'width 0.5s ease'
              }}
            />
          </div>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {user.reputationScore >= 90 ? "Excellent ! Vous êtes dans le top 5% des membres" :
             user.reputationScore >= 75 ? "Très bien ! Vous êtes un membre fiable" :
             "Continuez à améliorer votre réputation"}
          </p>
        </div>

        {/* Tontines */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '24px', border: '1px solid #f3f4f6' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Mes Tontines</h2>
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>Aucune tontine active</p>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
              Créez votre première tontine ou rejoignez un groupe existant
            </p>
          </div>
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => toast.info('Fonctionnalité en développement')}
            style={{
              background: 'linear-gradient(to right, #ea580c, #c2410c)',
              color: 'white',
              fontWeight: '600',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            ➕ Créer une nouvelle tontine
          </button>

          <button 
            onClick={() => toast.info('Fonctionnalité en développement')}
            style={{
              background: 'linear-gradient(to right, #475569, #334155)',
              color: 'white',
              fontWeight: '600',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            👥 Rejoindre un groupe
          </button>
        </div>

        {/* Info debug */}
        <div style={{ marginTop: '32px', padding: '16px', background: '#dbeafe', borderRadius: '16px' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1e40af', fontWeight: '600' }}>🚀 Version de développement</h3>
          <div style={{ fontSize: '14px', color: '#1e40af' }}>
            <p style={{ margin: '4px 0' }}>ID: {user.id}</p>
            <p style={{ margin: '4px 0' }}>Vérifié: {user.isVerified ? '✅ Oui' : '❌ Non'}</p>
            <p style={{ margin: '4px 0' }}>Niveau: {user.trustLevel}</p>
            <p style={{ margin: '4px 0' }}>Score: {user.reputationScore}/100</p>
          </div>
        </div>
      </div>
    </div>
  );
};