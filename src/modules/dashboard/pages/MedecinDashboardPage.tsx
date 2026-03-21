import DashboardLayout from '@/layouts/DashboardLayout';
import StatsCard from '@/components/common/StatsCard';
import StatusBadge from '@/components/common/StatusBadge';
import { CalendarDays, Clock, CheckCircle, XCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockRendezVous } from '@/data/mockRendezVous';
import { useAuth } from '@/contexts/AuthContext';

const weekData = [
  { jour: 'Lun', rdv: 5 }, { jour: 'Mar', rdv: 8 }, { jour: 'Mer', rdv: 3 },
  { jour: 'Jeu', rdv: 7 }, { jour: 'Ven', rdv: 6 }, { jour: 'Sam', rdv: 2 }, { jour: 'Dim', rdv: 0 },
];

const MedecinDashboard = () => {
  const { user } = useAuth();
  const myRdvs = mockRendezVous.filter(r => r.medecinId === 'm1');
  const todayRdvs = myRdvs.filter(r => r.date === '2026-03-18');

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div className="medibook-card bg-gradient-to-r from-primary-dark to-primary-light">
          <h2 className="text-xl font-bold text-primary-foreground">Bonjour Dr. {user?.nom} 👋</h2>
          <p className="text-primary-foreground/80 text-sm mt-1">Vous avez {todayRdvs.length} rendez-vous aujourd'hui</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard icon={CalendarDays} value={myRdvs.length} label="Total RDV" color="green" />
          <StatsCard icon={Clock} value={myRdvs.filter(r => r.statut === 'EN_ATTENTE').length} label="En attente" color="orange" />
          <StatsCard icon={CheckCircle} value={myRdvs.filter(r => r.statut === 'CONFIRME').length} label="Confirmés" color="blue" />
          <StatsCard icon={XCircle} value={myRdvs.filter(r => r.statut === 'TERMINE').length} label="Terminés" color="grey" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="medibook-card">
            <h3 className="font-semibold mb-4">Prochains RDV du jour</h3>
            <div className="space-y-3">
              {todayRdvs.length === 0 ? <p className="text-sm text-muted-foreground">Aucun RDV aujourd'hui</p> : todayRdvs.map(rv => (
                <div key={rv.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div><p className="text-sm font-medium">{rv.patientNom}</p><p className="text-xs text-muted-foreground">{rv.motif}</p></div>
                  <div className="text-right"><p className="text-sm font-medium">{rv.heure}</p><StatusBadge status={rv.statut} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="medibook-card">
            <h3 className="font-semibold mb-4">Évolution des RDV (7 jours)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={weekData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,88%)" /><XAxis dataKey="jour" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip />
                <Area type="monotone" dataKey="rdv" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MedecinDashboard;
