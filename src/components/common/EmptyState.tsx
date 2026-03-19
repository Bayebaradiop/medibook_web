import { type LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  message: string;
  description?: string;
}

const EmptyState = ({ icon: Icon = Inbox, message, description }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
      <Icon size={32} className="text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold text-foreground">{message}</h3>
    {description && <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>}
  </div>
);

export default EmptyState;
