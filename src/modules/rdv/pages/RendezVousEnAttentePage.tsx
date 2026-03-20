import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { mockRendezVous } from '@/data/mockRendezVous';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const RendezVousEnAttentePage = () => {
  const pendingRdvs = mockRendezVous.filter(r => r.statut === 'EN_ATTENTE');

  return (
    <DashboardLayout title="RDV en attente">
      <div className="space-y-6">
        <div className="medibook-card bg-warning/10 border border-warning/20 flex items-center gap-3">
          <AlertTriangle className="text-warning shrink-0" size={24} />
          <div>
            <p className="font-semibold text-foreground">{pendingRdvs.length} rendez-vous en attente</p>
            <p className="text-sm text-muted-foreground">Ces RDV nécessitent votre attention</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingRdvs.map(rv => (
            <div key={rv.id} className="medibook-card border border-warning/20">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{rv.patientNom}</p>
                  <p className="text-sm text-muted-foreground">{rv.medecinNom}</p>
                </div>
                <StatusBadge status={rv.statut} />
              </div>
              <div className="text-sm text-muted-foreground space-y-1 mb-4">
                <p>📅 {rv.date} à {rv.heure}</p>
                <p>📋 {rv.motif}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toast.success('RDV confirmé')} className="medibook-btn h-10 px-4 text-sm flex-1 flex items-center justify-center gap-1"><CheckCircle size={16} /> Confirmer</button>
                <button onClick={() => toast.success('RDV annulé')} className="h-10 px-4 text-sm font-semibold rounded-2xl bg-destructive text-card transition-all duration-200 active:scale-[0.98] hover:brightness-90 flex-1 flex items-center justify-center gap-1"><XCircle size={16} /> Annuler</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RendezVousEnAttentePage;
