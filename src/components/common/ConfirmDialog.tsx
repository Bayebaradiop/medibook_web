import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  destructive?: boolean;
}

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirmer', destructive = true }: ConfirmDialogProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40" onClick={onCancel}>
      <div className="medibook-card w-full max-w-md mx-4 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${destructive ? 'bg-destructive/10' : 'bg-primary/10'}`}>
              <AlertTriangle size={20} className={destructive ? 'text-destructive' : 'text-primary'} />
            </div>
            <h3 className="font-semibold">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="medibook-btn-outline h-10 px-4 text-sm">Annuler</button>
          <button onClick={onConfirm} className={`h-10 px-4 text-sm font-semibold rounded-2xl text-card transition-all duration-200 active:scale-[0.98] ${destructive ? 'bg-destructive hover:brightness-90' : 'bg-primary hover:brightness-90'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
