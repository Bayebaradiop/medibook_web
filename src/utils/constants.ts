export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MEDECIN' | 'SECRETAIRE';

export type AppointmentStatus = 'EN_ATTENTE' | 'CONFIRME' | 'TERMINE' | 'ANNULE';
export type EntityStatus = 'ACTIF' | 'INACTIF';
export type ExceptionType = 'ABSENT';

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  EN_ATTENTE: 'bg-status-pending/15 text-status-pending',
  CONFIRME: 'bg-status-confirmed/15 text-status-confirmed',
  TERMINE: 'bg-status-completed/15 text-status-completed',
  ANNULE: 'bg-status-cancelled/15 text-status-cancelled',
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  EN_ATTENTE: 'En attente',
  CONFIRME: 'Confirmé',
  TERMINE: 'Terminé',
  ANNULE: 'Annulé',
};

export const ENTITY_STATUS_COLORS: Record<EntityStatus, string> = {
  ACTIF: 'bg-status-active/15 text-status-active',
  INACTIF: 'bg-status-inactive/15 text-status-inactive',
};

export const DAYS_OF_WEEK = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'] as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrateur',
  MEDECIN: 'Médecin',
  SECRETAIRE: 'Secrétaire',
};
