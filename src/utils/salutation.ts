/**
 * Renvoie 'Bonjour' ou 'Bonsoir' selon l'heure actuelle.
 * - 05:00 à 17:59 => Bonjour
 * - 18:00 à 04:59 => Bonsoir
 */
export const getSalutation = (): string => {
  const hour = new Date().getHours();
  return hour >= 5 && hour < 18 ? 'Bonjour' : 'Bonsoir';
};

/**
 * Renvoie un emoji adapté à l'heure du jour (soleil ou lune/étoile).
 */
export const getSalutationEmoji = (): string => {
  const hour = new Date().getHours();
  return hour >= 5 && hour < 18 ? '☀️' : '🌙';
};
