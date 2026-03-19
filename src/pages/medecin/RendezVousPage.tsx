import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { mockRendezVous } from '@/data/mockRendezVous';
import type { AppointmentStatus } from '@/utils/constants';
import { CheckCircle, Check } from 'lucide-react';
import { toast } from 'sonner';

const tabs: { label: string; value: string }[] = [
  { label: 'Tous', value: 'ALL' },
  { label: 'En attente', value: 'EN_ATTENTE' },
  { label: 'Confirmés', value: 'CONFIRME' },
  { label: 'Terminés', value: 'TERMINE' },
  { label: 'Annulés', value: 'ANNULE' },
];

const RendezVousPage = () => {
  const [tab, setTab] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const navigate = useNavigate();

  const myRdvs = mockRendezVous.filter(r => r.medecinId === 'm1');
  const filtered = myRdvs.filter(r => {
    const matchTab = tab === 'ALL' || r.statut === tab;
    const matchDate = !dateFilter || r.date === dateFilter;
    return matchTab && matchDate;
  });

  return (
    <DashboardLayout title="Mes Rendez-vous">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1">
            {tabs.map(t => (
              <button key={t.value} onClick={() => setTab(t.value)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t.value ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted text-muted-foreground'}`}>{t.label}</button>
            ))}
          </div>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="medibook-input text-sm" />
        </div>

        <div className="medibook-card p-0 overflow-hidden"><div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="medibook-table-header"><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Heure</th><th className="px-4 py-3 text-left">Patient</th><th className="px-4 py-3 text-left">Motif</th><th className="px-4 py-3 text-left">Statut</th><th className="px-4 py-3 text-left">Actions</th></tr></thead>
            <tbody>
              {filtered.map(rv => (
                <tr key={rv.id} className="medibook-table-row cursor-pointer" onClick={() => navigate(`/medecin/rendez-vous/${rv.id}`)}>
                  <td className="px-4 py-3">{rv.date}</td>
                  <td className="px-4 py-3 font-medium">{rv.heure}</td>
                  <td className="px-4 py-3 font-medium">{rv.patientNom}</td>
                  <td className="px-4 py-3 text-muted-foreground">{rv.motif}</td>
                  <td className="px-4 py-3"><StatusBadge status={rv.statut} /></td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1">
                      {rv.statut === 'EN_ATTENTE' && <button onClick={() => toast.success('RDV confirmé')} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Confirmer"><CheckCircle size={16} /></button>}
                      {rv.statut === 'CONFIRME' && <button onClick={() => toast.success('RDV terminé')} className="p-2 rounded-lg bg-info/10 text-info hover:bg-info/20 transition-colors" title="Terminer"><Check size={16} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      </div>
    </DashboardLayout>
  );
};

export default RendezVousPage;
