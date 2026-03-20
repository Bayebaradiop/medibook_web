import DashboardLayout from '@/layouts/DashboardLayout';
import StatsCard from '@/components/common/StatsCard';
import StatusBadge from '@/components/common/StatusBadge';
import { Users, CalendarDays, Clock, Calendar } from 'lucide-react';
import { mockRendezVous } from '@/data/mockRendezVous';
import { useNavigate } from 'react-router-dom';

const SecretaireDashboard = () => {
  const navigate = useNavigate();
  const pendingRdvs = mockRendezVous.filter(r => r.statut === 'EN_ATTENTE');
  const todayRdvs = mockRendezVous.filter(r => r.date === '2026-03-18');

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard icon={Users} value={3} label="Médecins gérés" color="green" />
          <StatsCard icon={CalendarDays} value={mockRendezVous.length} label="Total RDV" color="blue" />
          <StatsCard icon={Clock} value={pendingRdvs.length} label="RDV en attente" color="orange" />
          <StatsCard icon={Calendar} value={todayRdvs.length} label="RDV aujourd'hui" color="red" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="medibook-card">
            <h3 className="font-semibold mb-4">RDV en attente</h3>
            <div className="space-y-3">
              {pendingRdvs.slice(0, 5).map(rv => (
                <div key={rv.id} className="flex items-center justify-between p-3 rounded-xl bg-warning/5 border border-warning/10">
                  <div><p className="text-sm font-medium">{rv.patientNom}</p><p className="text-xs text-muted-foreground">{rv.medecinNom} · {rv.date} {rv.heure}</p></div>
                  <StatusBadge status={rv.statut} />
                </div>
              ))}
            </div>
          </div>

          <div className="medibook-card">
            <h3 className="font-semibold mb-4">Raccourcis rapides</h3>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => navigate('/secretaire/plannings/nouveau')} className="medibook-btn-outline text-sm h-12 flex items-center justify-center gap-2"><Calendar size={18} /> Créer un planning</button>
              <button onClick={() => navigate('/secretaire/creneaux')} className="medibook-btn-outline text-sm h-12 flex items-center justify-center gap-2"><Clock size={18} /> Voir les créneaux</button>
              <button onClick={() => navigate('/secretaire/rdv-en-attente')} className="medibook-btn text-sm h-12 flex items-center justify-center gap-2"><CalendarDays size={18} /> RDV en attente ({pendingRdvs.length})</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecretaireDashboard;
