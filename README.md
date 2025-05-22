# 🏥 MedAdmin - Interface d'Administration Médicale

Une interface d'administration moderne et élégante pour la gestion d'une plateforme médicale en ligne, construite avec React, Vite et Material-UI.

## ✨ Fonctionnalités

### 🔐 Authentification & Sécurité
- Connexion sécurisée pour administrateurs
- Gestion des sessions avec JWT
- Authentification à deux facteurs (configurable)
- Rôles et permissions granulaires

### 👨‍⚕️ Gestion des Médecins
- **Liste complète** avec filtres avancés (statut, spécialité, etc.)
- **Validation des candidatures** avec système de révision détaillé
- **Profils détaillés** avec informations professionnelles
- **Suivi financier** (revenus, commissions, transactions)
- **Approbation/Rejet** des nouveaux médecins
- **Communication** directe par email

### 👥 Gestion des Patients
- **Annuaire complet** des patients inscrits
- **Profils détaillés** avec historique médical
- **Informations financières** et historique des paiements
- **Statuts d'activité** et suivi des consultations

### 📅 Gestion des Rendez-vous
- **Planning global** de tous les rendez-vous
- **Filtres temporels** (aujourd'hui, semaine, mois)
- **Statuts détaillés** (confirmé, en attente, terminé, annulé)
- **Types de consultation** (urgence, routine, contrôle)
- **Actions rapides** (modification, annulation)

### 💰 Module Financier Complet
- **Tableau de bord financier** avec KPIs temps réel
- **Suivi des revenus** globaux et par médecin
- **Gestion des paiements** et commissions
- **Méthodes de paiement** avec répartition statistique
- **Transactions détaillées** avec historique complet
- **Rapports exportables** en PDF/Excel

### ⚙️ Paramètres & Configuration
- **Gestion du profil** administrateur
- **Paramètres de sécurité** avancés
- **Configuration des notifications** 
- **Sauvegarde et export** des données
- **Personnalisation de l'interface**

## 🎨 Design & Interface

### Philosophie Design
Inspiré par Jony Ive et les principes de design Apple :
- **Minimalisme élégant** avec espaces blancs généreux
- **Typographie soignée** avec hiérarchie claire
- **Animations fluides** et transitions naturelles
- **Interface épurée** centrée sur l'utilisateur
- **Cohérence visuelle** à travers toute l'application

### Composants Réutilisables
- **DataTable** : Tableau avancé avec tri, filtres et pagination
- **Sidebar** : Navigation latérale moderne avec indicateurs visuels
- **Breadcrumb** : Navigation contextuelle intelligente
- **Cards statistiques** : Affichage des KPIs avec animations
- **Formulaires** : Validation temps réel avec feedback visuel

## 🚀 Installation

### Prérequis
```bash
Node.js >= 18.0.0
npm >= 8.0.0 ou yarn >= 1.22.0
```

### Installation des dépendances
```bash
# Cloner le projet
git clone https://github.com/your-repo/medadmin-frontend.git
cd medadmin-frontend

# Installer les dépendances
npm install

# Ou avec yarn
yarn install
```

### Configuration
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer les variables d'environnement
nano .env
```

### Lancement en développement
```bash
npm run dev
# ou
yarn dev
```

L'application sera accessible sur `http://localhost:5173`

## 📁 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── common/         # Composants génériques
│   │   ├── DataTable/  # Tableau de données avancé
│   │   └── Breadcrumb/ # Navigation contextuelle
│   ├── layout/         # Composants de mise en page
│   │   ├── AdminLayout.jsx
│   │   └── Sidebar.jsx
│   └── ProtectedRoute.jsx
├── contexts/           # Contextes React
│   └── AuthContext.jsx # Gestion de l'authentification
├── pages/              # Pages de l'application
│   ├── auth/          # Pages d'authentification
│   ├── dashboard/     # Tableau de bord
│   ├── doctors/       # Gestion des médecins
│   ├── patients/      # Gestion des patients
│   ├── appointments/  # Gestion des RDV
│   ├── finances/      # Module financier
│   └── settings/      # Paramètres
├── services/          # Services API
│   ├── api.js         # Configuration Axios
│   ├── authService.js # Service d'authentification
│   ├── doctorsService.js
│   ├── patientsService.js
│   ├── appointmentsService.js
│   └── paymentsService.js
├── styles/            # Styles CSS globaux
└── utils/             # Utilitaires
```

## 🔧 Configuration

### Variables d'environnement principales

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_URL` | URL de l'API backend | `http://localhost:5000/api` |
| `VITE_STORAGE_PREFIX` | Préfixe localStorage | `medadmin_` |
| `VITE_API_TIMEOUT` | Timeout des requêtes | `30000` |

### Personnalisation des thèmes
Les couleurs et styles peuvent être personnalisés via les fichiers CSS :
- `src/index.css` : Styles globaux
- `src/components/**/*.css` : Styles des composants

## 📊 Fonctionnalités Détaillées

### Gestion des Médecins
1. **Liste avec filtres** : Statut (vérifié/pendante), spécialité, date d'inscription
2. **Page de révision** : Validation complète des documents et informations
3. **Actions disponibles** :
   - ✅ Approuver le médecin
   - ❌ Rejeter la candidature  
   - 📧 Demander des informations supplémentaires
4. **Suivi financier** : Revenus, commissions, transactions détaillées

### Tableau de Bord
- **Statistiques temps réel** : Médecins, patients, rendez-vous, revenus
- **Activité récente** : Dernières actions sur la plateforme
- **Alertes importantes** : Candidatures en attente, problèmes à résoudre
- **Top performers** : Médecins les plus performants

### Module Financier
- **KPIs principaux** : Revenus totaux, croissance, paiements en attente
- **Répartition par méthode** : Cartes, virements, portefeuilles digitaux
- **Top médecins** : Classement par revenus générés
- **Transactions détaillées** : Historique complet avec filtres avancés

## 🔒 Sécurité

### Authentification
- **JWT tokens** avec expiration configurable
- **Sessions sécurisées** avec timeout automatique
- **Vérification des rôles** : Seuls les administrateurs peuvent accéder

### API & Communications
- **Intercepteurs Axios** pour gestion automatique des tokens
- **Gestion d'erreurs** centralisée avec redirections appropriées
- **Validation côté client** et serveur

### Données Sensibles
- **Chiffrement** des données sensibles en localStorage
- **Logs d'audit** pour traçabilité des actions administratives
- **Respect RGPD** avec options d'export/suppression des données

## 🎯 Roadmap

### Version 1.1
- [ ] Notifications push en temps réel
- [ ] Export avancé des rapports (PDF/Excel)
- [ ] Messagerie intégrée admin-médecins
- [ ] Audit logs détaillés

### Version 1.2
- [ ] Dashboard analytics avancé avec graphiques
- [ ] Gestion des spécialités médicales
- [ ] Système de tickets de support
- [ ] API REST complète documentée

### Version 2.0
- [ ] Application mobile dédiée
- [ ] Intelligence artificielle pour détection de fraudes
- [ ] Intégration calendriers externes
- [ ] Multi-langues complet

## 🤝 Contribution

### Guidelines
1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/amazing-feature`)
3. **Committer** les changements (`git commit -m 'Add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir** une Pull Request

### Standards de Code
- **ESLint** : Configuration stricte pour qualité du code
- **Prettier** : Formatage automatique et cohérent
- **Conventional Commits** : Messages de commit standardisés
- **Tests unitaires** : Couverture minimum 80%

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

- **Product Owner** : Définition des besoins fonctionnels
- **UI/UX Designer** : Conception interface utilisateur
- **Frontend Developer** : Développement React/TypeScript
- **Backend Developer** : API REST et base de données
- **DevOps Engineer** : Déploiement et infrastructure

## 📞 Support

Pour toute question ou support :
- 📧 Email : support@medadmin.com
- 💬 Discord : [Serveur communauté](https://discord.gg/medadmin)
- 📚 Documentation : [docs.medadmin.com](https://docs.medadmin.com)
- 🐛 Issues : [GitHub Issues](https://github.com/your-repo/issues)

---

**Made with ❤️ for the medical community**

## Intégration des API

Nous avons remplacé toutes les données factices (mock data) par des appels API réels pour récupérer les données depuis le serveur. Cette amélioration permet à l'application de fonctionner avec des données dynamiques provenant de la base de données.

### Composants modifiés

Voici les composants qui ont été modifiés pour utiliser les services API :

1. **AuthContext** : Utilise maintenant `authService` pour gérer l'authentification, récupérer l'utilisateur connecté et gérer les sessions.

2. **Dashboard** : Récupère les statistiques et les données en temps réel via plusieurs services API :
   - `doctorsService` pour les médecins
   - `patientsService` pour les patients
   - `appointmentsService` pour les rendez-vous
   - `paymentsService` pour les transactions financières

3. **PatientsList** : Utilise `patientsService` pour récupérer la liste des patients et effectuer les opérations CRUD.

4. **DoctorsList** : Utilise `doctorsService` pour récupérer la liste des médecins et gérer les actions comme la vérification ou la suppression.

5. **AppointmentsList** : Utilise `appointmentsService` pour récupérer les rendez-vous et les manipuler.

### Amélioration de l'expérience utilisateur

L'intégration des API a également permis d'améliorer l'expérience utilisateur :

- Ajout d'indicateurs de chargement (`CircularProgress`) pendant les requêtes
- Gestion des erreurs avec des messages appropriés
- Fonctionnalités de rechargement en cas d'erreur

### Structure des services

Tous les services suivent une structure cohérente et sont configurés pour communiquer avec le backend :

- `api.js` : Configuration d'Axios avec les intercepteurs pour l'authentification
- Services spécifiques : Implémentent les méthodes CRUD pour chaque entité (patients, médecins, rendez-vous, paiements)

### Configuration

L'application est configurée pour se connecter au backend via les variables d'environnement dans le fichier `.env` :

```
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
VITE_STORAGE_PREFIX=med_admin_
```

## Développement

Pour lancer l'application en mode développement :

```bash
npm run dev
```

## Production

Pour construire l'application pour la production :

```bash
npm run build
```