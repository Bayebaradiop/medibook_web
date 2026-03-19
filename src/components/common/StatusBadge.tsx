import { STATUS_COLORS, STATUS_LABELS, ENTITY_STATUS_COLORS, type AppointmentStatus, type EntityStatus } from '@/utils/constants';

interface StatusBadgeProps {
  status: AppointmentStatus | EntityStatus;
  type?: 'appointment' | 'entity';
}

const StatusBadge = ({ status, type = 'appointment' }: StatusBadgeProps) => {
  const isEntity = type === 'entity' || status === 'ACTIF' || status === 'INACTIF';
  const colorClass = isEntity
    ? ENTITY_STATUS_COLORS[status as EntityStatus]
    : STATUS_COLORS[status as AppointmentStatus];
  const label = isEntity
    ? (status === 'ACTIF' ? 'Actif' : 'Inactif')
    : STATUS_LABELS[status as AppointmentStatus];

  return (
    <span className={`medibook-badge ${colorClass}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
