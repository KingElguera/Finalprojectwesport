/**
 * Formate un nombre pour l'affichage (ex: 12500 -> "12.5k", 1500000 -> "1.5M")
 * @param count - Le nombre à formater
 * @returns Le nombre formaté en string
 */
export const formatCount = (count: number): string => {
  if (count < 1000) {
    return count.toString();
  }
  
  if (count < 1000000) {
    const thousands = count / 1000;
    // Si c'est un nombre rond (ex: 12000), on affiche "12k" au lieu de "12.0k"
    if (count % 1000 === 0) {
      return `${thousands}k`;
    }
    // Sinon on affiche avec une décimale (ex: 12500 -> "12.5k")
    return `${thousands.toFixed(1)}k`;
  }
  
  // Pour les millions
  const millions = count / 1000000;
  if (count % 1000000 === 0) {
    return `${millions}M`;
  }
  return `${millions.toFixed(1)}M`;
};

/**
 * Formate un timestamp en temps relatif
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}j`;
  return new Date(timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

