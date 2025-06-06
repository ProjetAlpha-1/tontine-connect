# 🏛️ Tontine Connect

**Digitalisation des tontines pour l'Afrique** - Application SaaS complète

[![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)](https://github.com/ProjetAlpha-1/tontine-connect)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)

> **Transformez votre tontine traditionnelle en solution digitale moderne avec paiements mobiles, gestion automatisée et interface intuitive.**

---

## 🚀 Démarrage rapide

```bash
# Cloner le repository
git clone https://github.com/ProjetAlpha-1/tontine-connect.git
cd tontine-connect

# Installer les dépendances
npm run setup

# Démarrer en mode développement
npm run dev
```

**Accès aux services**
- 🌐 Frontend: http://localhost:3000
- 🔗 API: http://localhost:3001  
- 📚 Documentation API: http://localhost:3001/api/docs

---

## 🏗️ Architecture

```
tontine-connect/
├── backend/        # API NestJS + TypeScript
├── frontend/       # App React PWA + TypeScript
├── shared/         # Types partagés
└── docker/         # Configuration Docker
```

---

## 📱 Fonctionnalités

### ✅ **Disponibles (v0.3.0)**

#### 🔐 **Authentification & Utilisateurs**
- ✅ Connexion par téléphone + OTP SMS
- ✅ Gestion des profils utilisateurs
- ✅ Système de réputation automatique (5 niveaux)

#### 🏛️ **Gestion des Tontines**
- ✅ **Création complète** avec formulaire intelligent
- ✅ **Système d'enrollment** avec invitations multiples
- ✅ **Validation automatique** des paramètres
- ✅ **Workflow en 4 étapes** structuré

#### 👥 **Enrollment des Membres**
- ✅ **Invitations par SMS** en lot
- ✅ **Liens partageables** sécurisés
- ✅ **QR Codes** (interface prête)
- ✅ **Système d'approbation** par le créateur
- ✅ **Suivi en temps réel** des demandes
- ✅ **Indicateurs de progression** visuels

#### 🎨 **Interface Utilisateur**
- ✅ **Design moderne** avec Tailwind CSS
- ✅ **Responsive** mobile et desktop
- ✅ **PWA** installable sur mobile
- ✅ **Navigation intuitive** avec breadcrumbs

### 🚧 **En développement**

#### ⚙️ **Configuration des Tontines** (Étape 3)
- 🚧 Détermination de l'ordre des paiements
- 🚧 Configuration des règles avancées
- 🚧 Validation finale avant activation

#### 📊 **Gestion Active** (Étape 4)
- 📋 Cycles de paiement automatisés
- 📋 Notifications et rappels
- 📋 Suivi des performances

### 📋 **Planifiées**

#### 💰 **Paiements**
- 📋 Intégration Mobile Money (Moov, Airtel)
- 📋 Gestion des transactions
- 📋 Historique des paiements

#### 💬 **Communication**
- 📋 Chat de groupe temps réel
- 📋 Notifications push
- 📋 Alertes automatiques

---

## 🌍 Marché cible

### 🇬🇦 **Gabon (Priorité)**
- 📱 Moov Money
- 📱 Airtel Money
- 🏦 Intégration bancaire locale

### 🌍 **Expansion prévue**
- 🇨🇲 Cameroun
- 🇨🇮 Côte d'Ivoire  
- 🇸🇳 Sénégal

---

## 🛠️ Stack Technique

### **Backend**
- **Framework** : NestJS + TypeScript
- **Base de données** : En mémoire (dev) → PostgreSQL (prod)
- **Authentification** : JWT + OTP SMS
- **Documentation** : Swagger automatique
- **Architecture** : Modulaire et scalable

### **Frontend**
- **Framework** : React + TypeScript
- **Routing** : React Router v7
- **State Management** : React Hooks
- **Styling** : Tailwind CSS
- **Forms** : React Hook Form + Yup
- **Icons** : Lucide React

### **DevOps**
- **Build** : Vite (Frontend) + NestJS CLI (Backend)
- **Deployment** : Docker + Docker Compose
- **Environment** : Variables d'environnement configurables

---

## 📋 Workflow des Tontines

### **Étape 1 : Création** ✅
```mermaid
graph LR
    A[Paramètres de base] --> B[Règles financières]
    B --> C[Dates et limites]
    C --> D[Validation]
    D --> E[Tontine créée]
```

### **Étape 2 : Enrollment** ✅
```mermaid
graph LR
    A[Invitations SMS/Lien] --> B[Demandes d'adhésion]
    B --> C[Approbation créateur]
    C --> D[Membres confirmés]
    D --> E[Validation minimum]
```

### **Étape 3 : Configuration** 🚧
```mermaid
graph LR
    A[Ordre des paiements] --> B[Règles finales]
    B --> C[Validation groupe]
    C --> D[Activation]
```

### **Étape 4 : Gestion Active** 📋
```mermaid
graph LR
    A[Cycles automatiques] --> B[Paiements]
    B --> C[Notifications]
    C --> D[Suivi performances]
```

---

## 🔧 Configuration

### **Variables d'environnement**

#### Backend (.env)
```bash
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/tontine

# JWT & Sécurité  
JWT_SECRET=your-super-secret-jwt-key
API_PREFIX=api/v1

# SMS (Future)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# URLs
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```bash
# API Configuration
VITE_API_URL=http://localhost:3001

# App Configuration
VITE_APP_NAME=Tontine Connect
VITE_APP_VERSION=0.3.0
```

---

## 🧪 API Documentation

### **Endpoints principaux**

#### **Authentification**
```http
POST /api/v1/auth/send-otp      # Envoyer OTP
POST /api/v1/auth/verify-otp    # Vérifier OTP  
GET  /api/v1/auth/profile       # Profil utilisateur
```

#### **Tontines**
```http
POST /api/v1/tontines           # Créer une tontine
GET  /api/v1/tontines           # Liste des tontines
GET  /api/v1/tontines/:id       # Détails d'une tontine
PUT  /api/v1/tontines/:id/status # Changer le statut
```

#### **Enrollment** 🆕
```http
GET  /api/v1/tontines/:id/enrollment                    # Page d'enrollment
POST /api/v1/tontines/:id/enrollment/invitations        # Créer invitation
POST /api/v1/tontines/:id/enrollment/invite-batch       # Invitations par lot
PUT  /api/v1/tontines/:id/enrollment/members/process    # Approuver/rejeter
POST /api/v1/tontines/:id/enrollment/respond            # Répondre à invitation
GET  /api/v1/tontines/:id/enrollment/stats              # Statistiques
```

**📚 Documentation complète** : http://localhost:3001/api/docs

---

## 🚀 Déploiement

### **Développement**
```bash
# Backend
cd backend && npm run start:dev

# Frontend  
cd frontend && npm run dev
```

### **Production**
```bash
# Docker Compose
docker-compose up -d

# Ou manuel
npm run build
npm run start:prod
```

---

## 🤝 Contribution

### **Structure des commits**
```bash
feat: nouvelle fonctionnalité
fix: correction de bug  
docs: mise à jour documentation
style: formatage, style
refactor: refactoring du code
test: ajout de tests
chore: tâches maintenance
```

### **Workflow de développement**
1. Fork le repository
2. Créer une branche feature : `git checkout -b feature/nom-feature`
3. Commit les changements : `git commit -m 'feat: description'`
4. Push vers la branche : `git push origin feature/nom-feature`
5. Ouvrir une Pull Request

---

## 📊 Roadmap

### **v0.4.0 - Configuration** (Q2 2025)
- ⚙️ Système de configuration des tontines
- 🎲 Algorithmes de détermination d'ordre
- ✅ Validation finale avant activation

### **v0.5.0 - Gestion Active** (Q3 2025)  
- 📊 Cycles de paiement automatisés
- 📱 Notifications et rappels
- 📈 Tableau de bord analytics

### **v1.0.0 - Production Ready** (Q4 2025)
- 💰 Intégration Mobile Money complète
- 💬 Chat temps réel
- 🔒 Sécurité renforcée
- 🌍 Déploiement multi-pays

---

## 📄 Licence

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👥 Équipe

**Développé avec ❤️ pour l'Afrique**

- 🇬🇦 **Marché principal** : Gabon
- 🌍 **Vision** : Démocratiser l'accès aux services financiers
- 🚀 **Mission** : Moderniser les tontines traditionnelles

---

## 📞 Contact & Support

- 📧 **Email** : contact@tontineconnect.ga
- 🐛 **Issues** : [GitHub Issues](https://github.com/ProjetAlpha-1/tontine-connect/issues)
- 📖 **Documentation** : [Wiki du projet](https://github.com/ProjetAlpha-1/tontine-connect/wiki)

---

<div align="center">

**🏛️ Tontine Connect - Digitalisez vos tontines avec confiance**

[![GitHub Stars](https://img.shields.io/github/stars/ProjetAlpha-1/tontine-connect?style=social)](https://github.com/ProjetAlpha-1/tontine-connect)
[![Follow](https://img.shields.io/github/followers/ProjetAlpha-1?style=social)](https://github.com/ProjetAlpha-1)

</div>
# 🌍 TontineConnect v0.4.0

> **Digitalisation des tontines pour l'Afrique** - Application SaaS complète pour la gestion moderne des tontines traditionnelles.

[![Version](https://img.shields.io/badge/version-0.4.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/nestjs-10.0.0-red.svg)](https://nestjs.com/)

## 🎉 **Version 0.4.0 - Module Configuration Complet !**

Cette version marque une **étape majeure** avec l'achèvement du module Configuration, rendant TontineConnect **100% opérationnel** pour le workflow complet de gestion des tontines.

### ✨ **Nouveautés v0.4.0**
- 🔧 **Module Configuration complet** avec 8 routes API
- 🎯 **Workflow de bout en bout** : Création → Enrollment → Configuration → Active
- 🤖 **Auto-création intelligente** des configurations
- 📊 **4 types d'ordre de paiement** : Manuel, Aléatoire, Ancienneté, Réputation
- ✅ **Interface moderne** en 3 étapes avec validation temps réel

---

## 🚀 **Démarrage Rapide**

### Prérequis
- Node.js ≥ 18.0.0
- npm ≥ 8.0.0

### Installation
```bash
# Cloner le repository
git clone https://github.com/ProjetAlpha-1/tontine-connect.git
cd tontine-connect

# Installer toutes les dépendances
npm run setup

# Démarrer en mode développement
npm run dev
```

### 🌐 **Accès aux Services**
- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:3001  
- **Documentation API**: http://localhost:3001/api/docs

---

## 🏗️ **Architecture**

```
tontine-connect/
├── backend/           # API NestJS + TypeScript
│   ├── src/
│   │   ├── auth/         # Module Authentification JWT + OTP
│   │   ├── tontines/     # Module Gestion des Tontines
│   │   ├── enrollment/   # Module Enrollment des Membres
│   │   ├── configuration/# Module Configuration (v0.4.0)
│   │   └── users/        # Module Utilisateurs
├── frontend/          # App React PWA + TypeScript
│   ├── src/
│   │   ├── pages/        # Pages principales
│   │   ├── components/   # Composants réutilisables
│   │   ├── hooks/        # Hooks React personnalisés
│   │   └── services/     # Services API
├── shared/            # Types TypeScript partagés
└── docker/            # Configuration Docker
```

---

## 📱 **Fonctionnalités Disponibles**

### ✅ **Module Authentification (v0.2.0)**
- 🔐 Authentification par téléphone + OTP SMS
- 🎫 Gestion des tokens JWT avec refresh automatique
- 🛡️ Protection des routes et middlewares sécurisés

### ✅ **Module Tontines (v0.2.0)**
- 📋 Création et gestion complète des tontines
- 📊 Tableau de bord avec statistiques
- 🔄 Gestion des statuts et transitions d'état

### ✅ **Module Enrollment (v0.3.0)**
- 📱 Invitations SMS automatiques avec tokens
- 👥 Gestion des membres et approbations
- ⚡ Interface responsive et intuitive

### ✅ **Module Configuration (v0.4.0)** 🆕
- 🎯 **Workflow en 3 étapes** : Ordre → Règles → Finalisation
- 🔄 **4 types d'ordre de paiement** :
  - 👆 **Manuel** : Ordre personnalisé par le créateur
  - 🎲 **Aléatoire** : Distribution équitable par tirage au sort
  - ⏰ **Ancienneté** : Priorité aux membres les plus anciens
  - ⭐ **Réputation** : Ordre basé sur le score de confiance
- 🤖 **Auto-création** des configurations manquantes
- ✅ **Validation temps réel** avec feedback utilisateur
- 📋 **Accords des membres** avec suivi des confirmations

### 🔄 **Workflow Complet Opérationnel**
```
1. Création Tontine → 2. Enrollment → 3. Configuration → 4. Tontine Active
      ✅                    ✅              ✅               🎯 v0.5.0
```

---

## 🛠️ **Stack Technique**

### Backend
- **Framework** : NestJS 10.0+ (Node.js/TypeScript)
- **Base de données** : Stockage en mémoire (PostgreSQL prévu v0.6.0)
- **Authentification** : JWT + OTP SMS
- **Documentation** : Swagger/OpenAPI automatique
- **Architecture** : Modulaire avec services, contrôleurs et DTOs

### Frontend  
- **Framework** : React 18.2+ avec TypeScript
- **UI/UX** : Tailwind CSS + composants modernes
- **State Management** : React Hooks + Context API
- **PWA** : Progressive Web App installable
- **Responsive** : Design mobile-first

### DevOps & Outils
- **Package Manager** : npm avec workspaces
- **Linting** : ESLint + Prettier
- **Git Hooks** : Husky pour la qualité du code
- **CI/CD** : GitHub Actions (à venir)
- **Docker** : Configuration multi-environnements

---

## 🌍 **Marché Cible**

### 🇬🇦 **Gabon** (Priorité)
- 💳 **Moov Money** - Intégration Mobile Money
- 📱 **Airtel Money** - Paiements mobiles
- 🏦 **Institutions financières** locales

### 🌍 **Expansion Prévue**
- Cameroun, Côte d'Ivoire, Sénégal
- Adaptation aux systèmes de paiement locaux
- Support multilingue (Français, Anglais, langues locales)

---

## 🎯 **Roadmap**

### 🚀 **v0.5.0 - Active Management** (Prochaine)
- 📊 **Dashboard temps réel** avec métriques avancées
- 💰 **Gestion des paiements** avec confirmations automatiques
- 🔄 **Cycles automatisés** selon la fréquence configurée
- 📱 **Notifications SMS/Email** automatiques
- 📈 **Rapports financiers** exportables

### 📋 **v0.6.0 - Database & Production**
- 🗄️ Migration vers PostgreSQL
- 🔒 Sécurité renforcée et audit trails
- 🌐 Déploiement en production
- ⚡ Optimisations de performance

### 💳 **v0.7.0 - Payments Integration**
- 💰 Intégration Moov Money (Gabon)
- 📱 Intégration Airtel Money
- 🏦 Connexions bancaires sécurisées
- 💸 Paiements automatiques

### 📱 **v0.8.0 - Mobile & Chat**
- 📱 Application mobile native (React Native)
- 💬 Chat de groupe temps réel
- 🔔 Notifications push avancées
- 📊 Analytics et insights

---

## 🧪 **Tests & Validation**

### ✅ **Tests Manuels Validés**
- Workflow complet Création → Active
- 4 types d'ordre de paiement
- Interface utilisateur responsive
- Authentification et sécurité

### 🔄 **Tests Automatisés** (v0.6.0)
- Tests unitaires Backend (Jest)
- Tests d'intégration API
- Tests E2E Frontend (Cypress)
- Tests de charge et performance

---

## 📖 **Documentation**

### 🔗 **Liens Utiles**
- **API Documentation** : http://localhost:3001/api/docs
- **Changelog Complet** : [CHANGELOG.md](CHANGELOG.md)
- **Guide de Contribution** : [CONTRIBUTING.md](CONTRIBUTING.md)
- **Architecture Technique** : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

### 📚 **Guides**
- [Guide d'Installation](docs/INSTALLATION.md)
- [Guide de Développement](docs/DEVELOPMENT.md)
- [Guide de Déploiement](docs/DEPLOYMENT.md)
- [API Reference](docs/API.md)

---

## 🤝 **Contribution**

Les contributions sont les bienvenues ! Consultez notre [guide de contribution](CONTRIBUTING.md) pour commencer.

### 🔄 **Process de Développement**
1. Fork le repository
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 **Licence**

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👥 **Équipe & Support**

### 🛠️ **Développement**
- **Lead Developer** : ProjetAlpha
- **Architecture** : NestJS + React TypeScript
- **Méthodologie** : Agile avec releases itératives

### 💬 **Support**
- **Issues GitHub** : [Rapporter un bug](https://github.com/ProjetAlpha-1/tontine-connect/issues)
- **Discussions** : [Forum communautaire](https://github.com/ProjetAlpha-1/tontine-connect/discussions)
- **Email** : support@tontineconnect.com

---

## 🎉 **Remerciements**

Merci à tous les contributeurs et à la communauté africaine des tontines pour l'inspiration et les retours précieux qui guident le développement de cette plateforme.

---

**🌍 TontineConnect - Modernisons ensemble les tontines africaines ! 🚀**