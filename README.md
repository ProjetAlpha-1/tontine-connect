# 🏦 TontineConnect

Digitalisation des tontines pour l'Afrique - Application SaaS complète

## 🚀 Démarrage rapide

### Installation
```bash
# Installer les dépendances
npm run setup

# Démarrer en mode développement
npm run dev

Accès aux services

Frontend: http://localhost:3000
API: http://localhost:3001
Documentation API: http://localhost:3001/api/docs

🏗️ Architecture
tontine-connect/
├── backend/          # API NestJS + TypeScript
├── frontend/         # App React PWA + TypeScript  
├── shared/           # Types partagés
└── docker/           # Configuration Docker
📱 Fonctionnalités

✅ Authentification par téléphone + OTP SMS
✅ Gestion complète des tontines
✅ Système de réputation automatique (5 niveaux)
✅ Paiements Mobile Money (Moov, Airtel)
✅ Chat de groupe temps réel
✅ PWA installable sur mobile

🌍 Marché cible
🇬🇦 Gabon (priorité) - Moov Money, Airtel Money
📜 Licence
MIT - voir LICENSE pour plus de détails.

## 🆕 Dernières mises à jour (v0.2.0)

### ✅ Nouvelles fonctionnalités
- **Page de création de tontine complète** avec validation avancée
- **API backend opérationnelle** pour la gestion des tontines
- **Workflow en 4 étapes** : Création → Enrollment → Configuration → Active
- **Interface utilisateur moderne** avec aperçu en temps réel

### 🚀 Fonctionnalités disponibles
- ✅ Création de tontines avec paramètres complets
- ✅ Navigation React Router entre les pages
- ✅ Validation des données frontend/backend
- ✅ API REST fonctionnelle
- 🚧 Enrollment des membres (en développement)

Voir le [CHANGELOG.md](./CHANGELOG.md) pour tous les détails.