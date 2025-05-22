/**
 * Utilitaires et fonctions d'aide pour l'application 
 */

// ==================== FORMATAGE ====================

/**
 * Formate un nombre en devise française (EUR)
 * @param {number} amount - Montant à formater
 * @param {string} locale - Locale (défaut: 'fr-FR')
 * @param {string} currency - Devise (défaut: 'EUR')
 * @returns {string} Montant formaté
 */
export const formatCurrency = (amount, locale = 'fr-FR', currency = 'EUR') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  /**
   * Formate une date en français
   * @param {string|Date} date - Date à formater
   * @param {Object} options - Options de formatage
   * @returns {string} Date formatée
   */
  export const formatDate = (date, options = {}) => {
    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    
    return new Date(date).toLocaleDateString('fr-FR', { ...defaultOptions, ...options });
  };
  
  /**
   * Formate une heure
   * @param {string|Date} time - Heure à formater
   * @returns {string} Heure formatée
   */
  export const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Formate un numéro de téléphone français
   * @param {string} phone - Numéro de téléphone
   * @returns {string} Numéro formaté
   */
  export const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('33')) {
      return cleaned.replace(/(\d{2})(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5 $6');
    }
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  };
  
  // ==================== VALIDATION ====================
  
  /**
   * Valide une adresse email
   * @param {string} email - Email à valider
   * @returns {boolean} Validité de l'email
   */
  export const isValidEmail = (email) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };
  
  /**
   * Valide un numéro de téléphone français
   * @param {string} phone - Téléphone à valider
   * @returns {boolean} Validité du téléphone
   */
  export const isValidPhone = (phone) => {
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return phoneRegex.test(phone);
  };
  
  /**
   * Valide la force d'un mot de passe
   * @param {string} password - Mot de passe à valider
   * @returns {Object} Résultat de validation avec score et critères
   */
  export const validatePasswordStrength = (password) => {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(criteria).filter(Boolean).length;
    
    return {
      score,
      isValid: score >= 4,
      criteria,
      strength: score <= 2 ? 'Faible' : score <= 3 ? 'Moyen' : score <= 4 ? 'Fort' : 'Très fort'
    };
  };
  
  // ==================== UTILITAIRES DONNÉES ====================
  
  /**
   * Trie un tableau d'objets par propriété
   * @param {Array} array - Tableau à trier
   * @param {string} key - Clé de tri
   * @param {string} direction - Direction ('asc' ou 'desc')
   * @returns {Array} Tableau trié
   */
  export const sortByProperty = (array, key, direction = 'asc') => {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };
  
  /**
   * Filtre un tableau par terme de recherche
   * @param {Array} array - Tableau à filtrer
   * @param {string} searchTerm - Terme de recherche
   * @param {Array} searchFields - Champs dans lesquels chercher
   * @returns {Array} Tableau filtré
   */
  export const filterBySearchTerm = (array, searchTerm, searchFields) => {
    if (!searchTerm) return array;
    
    const term = searchTerm.toLowerCase();
    
    return array.filter(item => 
      searchFields.some(field => {
        const value = getNestedProperty(item, field);
        return value && value.toString().toLowerCase().includes(term);
      })
    );
  };
  
  /**
   * Récupère une propriété imbriquée d'un objet
   * @param {Object} obj - Objet source
   * @param {string} path - Chemin vers la propriété (ex: 'user.profile.name')
   * @returns {*} Valeur de la propriété
   */
  export const getNestedProperty = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };
  
  /**
   * Groupe un tableau d'objets par propriété
   * @param {Array} array - Tableau à grouper
   * @param {string} key - Clé de groupement
   * @returns {Object} Objet avec les groupes
   */
  export const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  };
  
  // ==================== UTILITAIRES UI ====================
  
  /**
   * Génère une couleur basée sur un texte (pour avatars)
   * @param {string} text - Texte source
   * @returns {string} Code couleur hexadécimal
   */
  export const generateColorFromText = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 50%)`;
  };
  
  /**
   * Génère des initiales à partir d'un nom
   * @param {string} name - Nom complet
   * @returns {string} Initiales (max 2 caractères)
   */
  export const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  /**
   * Tronque un texte à une longueur donnée
   * @param {string} text - Texte à tronquer
   * @param {number} maxLength - Longueur maximale
   * @returns {string} Texte tronqué
   */
  export const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
  
  // ==================== STOCKAGE LOCAL ====================
  
  /**
   * Sauvegarde sécurisée dans le localStorage
   * @param {string} key - Clé de stockage
   * @param {*} value - Valeur à stocker
   */
  export const secureLocalStorage = {
    set: (key, value) => {
      try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(`${import.meta.env.VITE_STORAGE_PREFIX}${key}`, serializedValue);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    },
    
    get: (key) => {
      try {
        const item = localStorage.getItem(`${import.meta.env.VITE_STORAGE_PREFIX}${key}`);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Erreur lors de la récupération:', error);
        return null;
      }
    },
    
    remove: (key) => {
      localStorage.removeItem(`${import.meta.env.VITE_STORAGE_PREFIX}${key}`);
    },
    
    clear: () => {
      const prefix = import.meta.env.VITE_STORAGE_PREFIX;
      Object.keys(localStorage)
        .filter(key => key.startsWith(prefix))
        .forEach(key => localStorage.removeItem(key));
    }
  };
  
  // ==================== UTILITAIRES MÉTIER ====================
  
  /**
   * Calcule l'âge à partir d'une date de naissance
   * @param {string|Date} birthDate - Date de naissance
   * @returns {number} Âge en années
   */
  export const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  
  /**
   * Calcule le pourcentage de croissance
   * @param {number} oldValue - Ancienne valeur
   * @param {number} newValue - Nouvelle valeur
   * @returns {number} Pourcentage de croissance
   */
  export const calculateGrowthPercentage = (oldValue, newValue) => {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  };
  
  /**
   * Génère une couleur de statut
   * @param {string} status - Statut
   * @returns {string} Couleur MUI correspondante
   */
  export const getStatusColor = (status) => {
    const statusMap = {
      // Statuts généraux
      'active': 'success',
      'inactive': 'error',
      'pending': 'warning',
      'completed': 'success',
      'cancelled': 'error',
      'confirmed': 'info',
      
      // Statuts médecins
      'verified': 'success',
      'unverified': 'warning',
      'suspended': 'error',
      
      // Statuts paiements
      'paid': 'success',
      'unpaid': 'error',
      'processing': 'warning',
      'refunded': 'info'
    };
    
    return statusMap[status.toLowerCase()] || 'default';
  };
  
  // ==================== DEBUG & DÉVELOPPEMENT ====================
  
  /**
   * Logger de développement
   * @param {string} level - Niveau de log
   * @param {string} message - Message
   * @param {*} data - Données supplémentaires
   */
  export const devLog = (level, message, data = null) => {
    if (import.meta.env.VITE_APP_ENV !== 'development') return;
    
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage, data);
        break;
      case 'warn':
        console.warn(logMessage, data);
        break;
      case 'info':
        console.info(logMessage, data);
        break;
      default:
        console.log(logMessage, data);
    }
  };
  
  /**
   * Mesure les performances d'une fonction
   * @param {Function} fn - Fonction à mesurer
   * @param {string} label - Label de la mesure
   * @returns {*} Résultat de la fonction
   */
  export const measurePerformance = async (fn, label = 'Function') => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    devLog('info', `${label} took ${(end - start).toFixed(2)} milliseconds`);
    return result;
  };
  
  // ==================== EXPORT PAR DÉFAUT ====================
  
  export default {
    formatCurrency,
    formatDate,
    formatTime,
    formatPhone,
    isValidEmail,
    isValidPhone,
    validatePasswordStrength,
    sortByProperty,
    filterBySearchTerm,
    getNestedProperty,
    groupBy,
    generateColorFromText,
    getInitials,
    truncateText,
    secureLocalStorage,
    calculateAge,
    calculateGrowthPercentage,
    getStatusColor,
    devLog,
    measurePerformance
  };