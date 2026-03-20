import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { mockRendezVous } from '@/data/mockRendezVous';
import { mockMedecins } from '@/data/mockUsers';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const SecretaireRendezVousPage = () => {
  const [filterMedecin, setFilterMedecin] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filtered = mockRendezVous.filter(r => {
    const mm = !filterMedecin || r.medecinId === filterMedecin;
    const ms = !filterStatus || r.statut === filterStatus;
    const md = !filterDate || r.date === filterDate;
    return mm && ms && md;
  });

  return (
    <DashboardLayout title="Rendez-vous">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <select value={filterMedecin} onChange={e => setFilterMedecin(e.target.value)} className="medibook-input text-sm">
            <option value="">Tous les médecins</option>
            {mockMedecins.map(m => <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="medibook-input text-sm">
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="CONFIRME">Confirmé</option>
            <option value="TERMINE">Terminé</option>
            <option value="ANNULE">Annulé</option>
          </select>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="medibook-input text-sm" />
        </div>

        <div className="medibook-card p-0 overflow-hidden"><div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="medibook-table-header"><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Heure</th><th className="px-4 py-3 text-left">Médecin</th><th className="px-4 py-3 text-left">Patient</th><th className="px-4 py-3 text-left">Motif</th><th className="px-4 py-3 text-left">Statut</th><th className="px-4 py-3 text-left">Actions</th></tr></thead>
            <tbody>
              {filtered.map(rv => (
                <tr key={rv.id} className="medibook-table-row">
                  <td className="px-4 py-3">{rv.date}</td>
                  <td className="px-4 py-3 font-medium">{rv.heure}</td>
                  <td className="px-4 py-3">{rv.medecinNom}</td>
                  <td className="px-4 py-3 font-medium">{rv.patientNom}</td>
                  <td className="px-4 py-3 text-muted-foreground">{rv.motif}</td>
                  <td className="px-4 py-3"><StatusBadge status={rv.statut} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {rv.statut === 'EN_ATTENTE' && <button onClick={() => toast.success('Confirmé')} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"><CheckCircle size={16} /></button>}
                      {(rv.statut === 'EN_ATTENTE' || rv.statut === 'CONFIRME') && <button onClick={() => toast.success('Annulé')} className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"><XCircle size={16} /></button>}
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

export default SecretaireRendezVousPage;
