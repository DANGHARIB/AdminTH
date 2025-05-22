# Services API

Ce dossier contient les services pour communiquer avec l'API backend de notre application mobile.

## Structure

- `api.js` : Configuration principale du client HTTP (Axios)
- `authService.js` : Gestion de l'authentification (login, register, logout, etc.)
- `doctorsService.js` : Opérations CRUD pour les médecins et accès à leurs finances
- `patientsService.js` : Opérations CRUD pour les patients et accès à leurs finances
- `appointmentsService.js` : Opérations CRUD pour les rendez-vous
- `paymentsService.js` : Opérations CRUD pour les paiements
- `index.js` : Exporte tous les services

## Configuration

Les services utilisent les variables d'environnement suivantes :

```
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000
VITE_STORAGE_PREFIX=admin_app_
```

Ces variables doivent être définies dans le fichier `.env` à la racine du projet.

## Points d'API supportés

### Authentification
- Register : `POST /auth/register`
- Login : `POST /auth/login` 
- Profil utilisateur : `GET /auth/profile`

### Médecins
- Liste des médecins : `GET /doctors` (avec pagination et filtres)
- Détails d'un médecin : `GET /doctors/:id`
- Finances d'un médecin : `GET /doctors/:id/finances`
- Paiements d'un médecin : `GET /payments?doctorId=:id`
- CRUD complet pour les médecins

### Patients
- Liste des patients : `GET /patients` (avec pagination et filtres)
- Détails d'un patient : `GET /patients/:id`
- Finances d'un patient : `GET /patients/:id/finances`
- Paiements d'un patient : `GET /payments?patientId=:id`
- CRUD complet pour les patients

### Rendez-vous
- Liste des RDV : `GET /appointments` (avec pagination et filtres)
- RDV d'un médecin : `GET /appointments?doctorId=:id`
- RDV d'un patient : `GET /appointments?patientId=:id`
- Détails d'un RDV : `GET /appointments/:id`
- Notes d'un RDV : `GET /appointment-notes?appointmentId=:id`
- CRUD complet pour les rendez-vous

### Paiements
- Liste des paiements : `GET /payments` (avec filtres)
- Détails d'un paiement : `GET /payments/:id`
- CRUD complet pour les paiements

## Utilisation

Pour utiliser un service dans un composant :

```jsx
import { doctorsService } from '../services';

// Dans un composant avec React hooks
const MyComponent = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const data = await doctorsService.getAllDoctors();
        setDoctors(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Erreur lors de la récupération des médecins');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Reste du composant...
};
```

## Authentification

L'authentification est gérée automatiquement par l'intercepteur dans `api.js`. Le token JWT est stocké dans le localStorage et automatiquement ajouté aux en-têtes des requêtes.

En cas d'erreur 401 (non autorisé), l'utilisateur est automatiquement redirigé vers la page de connexion.

## Vérification des rôles

Le service d'authentification vérifie automatiquement que l'utilisateur qui se connecte possède bien le rôle "admin". Si ce n'est pas le cas, il sera impossible d'accéder à l'application.

## Gestion des erreurs

Chaque service gère les erreurs et les renvoie sous un format standardisé. Utilisez try/catch pour gérer ces erreurs dans vos composants. 