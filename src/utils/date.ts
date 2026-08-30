/**
 * Formate une date au format français court (ex: 15/08/2026)
 */
export const formatDateFR = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '';
  try {
    // Si c'est au format YYYY-MM-DD, éviter le décalage UTC en parsant manuellement
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
      const [year, month, day] = dateInput.split('T')[0].split('-').map(Number);
      if (year && month && day) {
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      }
    }
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return String(dateInput);
  }
};

/**
 * Formate une date au format français rédigé (ex: 15 août 2026 ou lundi 15 août 2026)
 */
export const formatDateLettresFR = (dateInput?: string | Date | null, avecJour = false): string => {
  if (!dateInput) return '';
  try {
    let d: Date;
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
      const [year, month, day] = dateInput.split('T')[0].split('-').map(Number);
      d = new Date(year, month - 1, day);
    } else {
      d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    }
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('fr-FR', {
      weekday: avecJour ? 'long' : undefined,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return String(dateInput);
  }
};

/**
 * Formate une date et une heure au format français (ex: 15/08/2026 à 14:30)
 */
export const formatDateTimeFR = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);
    const dateStr = formatDateFR(d);
    const timeStr = d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateStr} à ${timeStr}`;
  } catch {
    return String(dateInput);
  }
};
