import { Profile } from './lib/types';

const STORAGE_KEY = 'wesport_profile';
const DEFAULT_PROFILE: Profile = {
  username: 'jordan_athlete',
  bio: 'Obsessed with progress. 🏋️‍♂️🚴‍♂️',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
  usernameChangeHistory: [],
};

const USERNAME_CHANGE_LIMIT = 2; // Maximum 2 changements
const USERNAME_CHANGE_WINDOW_MS = 3 * 30 * 24 * 60 * 60 * 1000; // 3 mois en millisecondes (approximation: 3 * 30 jours)

/**
 * Charge le profil depuis localStorage ou retourne le profil par défaut
 */
export const loadProfile = (): Profile => {
  if (typeof window === 'undefined') return { ...DEFAULT_PROFILE };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Profile;
      // S'assurer que tous les champs sont présents
      return {
        username: parsed.username || DEFAULT_PROFILE.username,
        bio: parsed.bio ?? DEFAULT_PROFILE.bio,
        avatarUrl: parsed.avatarUrl || DEFAULT_PROFILE.avatarUrl,
        usernameChangeHistory: parsed.usernameChangeHistory || [],
      };
    }
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error);
  }
  return { ...DEFAULT_PROFILE };
};

/**
 * Sauvegarde le profil dans localStorage
 */
export const saveProfile = (profile: Profile): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du profil:', error);
  }
};

/**
 * Vérifie si l'utilisateur peut changer son pseudo maintenant
 * @param currentTime - Timestamp actuel (optionnel, par défaut Date.now())
 * @returns true si le changement est autorisé, false sinon
 */
export const canChangeUsername = (currentTime: number = Date.now()): boolean => {
  const profile = loadProfile();
  const history = profile.usernameChangeHistory || [];
  
  // Si moins de 2 changements, autorisé
  if (history.length < USERNAME_CHANGE_LIMIT) {
    return true;
  }
  
  // Vérifier les changements dans la fenêtre de 3 mois
  const threeMonthsAgo = currentTime - USERNAME_CHANGE_WINDOW_MS;
  const recentChanges = history.filter(timestamp => timestamp >= threeMonthsAgo);
  
  // Si moins de 2 changements dans les 3 derniers mois, autorisé
  return recentChanges.length < USERNAME_CHANGE_LIMIT;
};

/**
 * Calcule la date à laquelle l'utilisateur pourra rechanger son pseudo
 * @param currentTime - Timestamp actuel (optionnel, par défaut Date.now())
 * @returns Date à laquelle le changement sera possible, ou null si déjà possible
 */
export const getNextUsernameChangeDate = (currentTime: number = Date.now()): Date | null => {
  if (canChangeUsername(currentTime)) {
    return null; // Déjà possible
  }
  
  const profile = loadProfile();
  const history = profile.usernameChangeHistory || [];
  
  if (history.length === 0) {
    return null;
  }
  
  // Trier les timestamps par ordre décroissant
  const sortedHistory = [...history].sort((a, b) => b - a);
  
  // Prendre les 2 changements les plus récents
  const recentChanges = sortedHistory.slice(0, USERNAME_CHANGE_LIMIT);
  
  // Le plus ancien des 2 changements récents
  const oldestRecentChange = recentChanges[recentChanges.length - 1];
  
  // La date à laquelle on pourra rechanger = date du plus ancien changement + 3 mois
  const nextChangeDate = oldestRecentChange + USERNAME_CHANGE_WINDOW_MS;
  
  return new Date(nextChangeDate);
};

/**
 * Met à jour le profil avec un nouveau pseudo si autorisé
 * @param newUsername - Nouveau pseudo
 * @returns true si la mise à jour a réussi, false sinon
 */
export const updateUsername = (newUsername: string): boolean => {
  const currentTime = Date.now();
  
  if (!canChangeUsername(currentTime)) {
    return false;
  }
  
  const profile = loadProfile();
  
  // Si le pseudo change vraiment
  if (profile.username !== newUsername) {
    profile.usernameChangeHistory.push(currentTime);
    profile.username = newUsername;
    saveProfile(profile);
  }
  
  return true;
};

/**
 * Met à jour la bio du profil
 */
export const updateBio = (bio: string): void => {
  const profile = loadProfile();
  profile.bio = bio;
  saveProfile(profile);
};

/**
 * Met à jour l'avatar du profil
 */
export const updateAvatar = (avatarUrl: string): void => {
  const profile = loadProfile();
  profile.avatarUrl = avatarUrl;
  saveProfile(profile);
};
