# Guide d'Installation et d'Exécution - MedAdmin

Ce guide détaillé vous aidera à installer et exécuter l'application MedAdmin sur n'importe quel PC.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants sur votre ordinateur:

- **Node.js**: Version 18.0.0 ou supérieure
  - Téléchargement: [https://nodejs.org/](https://nodejs.org/)
  - Vérification: `node -v` dans un terminal
  
- **npm**: Version 8.0.0 ou supérieure (installé avec Node.js)
  - Vérification: `npm -v` dans un terminal
  
- **Git**: Pour cloner le dépôt (optionnel)
  - Téléchargement: [https://git-scm.com/downloads](https://git-scm.com/downloads)
  - Vérification: `git --version` dans un terminal

## Étape 1: Récupération du projet

### Option A: Cloner avec Git (recommandé)

Si vous avez Git installé:

```bash
# Cloner le dépôt
git clone [URL_DU_DEPOT]

# Accéder au dossier du projet
cd AdminTH
```

### Option B: Télécharger manuellement

1. Téléchargez l'archive ZIP du projet
2. Extrayez-la à l'emplacement de votre choix
3. Ouvrez un terminal dans le dossier extrait

## Étape 2: Installation des dépendances

Dans le dossier racine du projet (où se trouve le fichier `package.json`), exécutez:

```bash
npm install
```

Cette commande installera toutes les dépendances nécessaires au fonctionnement de l'application, notamment:
- React 19
- Material UI 7
- React Router 7
- Axios pour les requêtes API
- Vite comme outil de build

L'installation peut prendre quelques minutes selon la vitesse de votre connexion internet.

## Étape 3: Configuration de l'environnement (si nécessaire)

Si le projet nécessite des variables d'environnement:

1. Créez un fichier `.env` à la racine du projet
2. Remplissez-le avec les variables nécessaires (demandez à l'administrateur si nécessaire)

Exemple de contenu possible:
```
VITE_API_URL=http://localhost:5000/api
VITE_STORAGE_PREFIX=medadmin_
VITE_API_TIMEOUT=30000
```

## Étape 4: Lancement de l'application

### En mode développement

Pour lancer l'application en mode développement avec rechargement automatique:

```bash
npm run dev
```

L'application sera accessible dans votre navigateur à l'adresse: **http://localhost:5173**

### En mode production

Pour créer une version optimisée pour la production:

```bash
# Construire l'application
npm run build

# Prévisualiser la version de production
npm run preview
```

La version de production sera accessible à l'adresse indiquée dans le terminal (généralement **http://localhost:4173**).

## Étape 5: Accès à l'application

1. Ouvrez votre navigateur web (Chrome, Firefox, Edge recommandés)
2. Accédez à l'URL indiquée après le lancement (http://localhost:5173 en développement)
3. Connectez-vous avec les identifiants administrateur fournis

## Résolution des problèmes courants

### Erreur "npm command not found"
- Vérifiez que Node.js est correctement installé
- Redémarrez le terminal après l'installation de Node.js

### Erreur de port déjà utilisé
- Changez le port en utilisant: `npm run dev -- --port 3000`
- Fermez l'application qui utilise déjà le port 5173

### Erreurs de dépendances
- Supprimez le dossier `node_modules` et le fichier `package-lock.json`
- Relancez `npm install`

### Problèmes d'API ou de connexion
- Vérifiez que le backend est en cours d'exécution
- Assurez-vous que les variables d'environnement sont correctement configurées

## Informations techniques supplémentaires

- **Architecture Frontend**: React 19 avec Vite 6
- **UI Framework**: Material UI 7
- **Gestion d'état**: Zustand
- **Routage**: React Router 7
- **Validation de formulaires**: React Hook Form et Zod
- **Requêtes API**: Axios

## Ressources et liens utiles

- Documentation de React: [https://react.dev/](https://react.dev/)
- Documentation de Vite: [https://vitejs.dev/](https://vitejs.dev/)
- Documentation de Material UI: [https://mui.com/](https://mui.com/)

Pour toute question supplémentaire, veuillez contacter l'équipe de support.

---

Document créé le: **18/10/2023** 