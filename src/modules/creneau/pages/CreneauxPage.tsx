import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { mockCreneaux } from '@/data/mockCreneaux';
import { mockMedecins } from '@/data/mockUsers';
import { Calendar, List, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const CreneauxPage = () => {
  const [selectedMedecin, setSelectedMedecin] = useState('m1');
  const [dateFilter, setDateFilter] = useState('');
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const filtered = mockCreneaux.filter(c => {
    const matchMedecin = c.medecinId === selectedMedecin;
    const matchDate = !dateFilter || c.date === dateFilter;
    return matchMedecin && matchDate;
  });

  return (
    <DashboardLayout title="Créneaux">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={selectedMedecin} onChange={e => setSelectedMedecin(e.target.value)} className="medibook-input text-sm">
              {mockMedecins.map(m => <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>)}
            </select>
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="medibook-input text-sm" />
          </div>
          <div className="flex rounded-xl border border-border overflow-hidden">
            <button onClick={() => setView('list')} className={`p-2 px-3 flex items-center gap-1 text-sm ${view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><List size={16} /> Liste</button>
            <button onClick={() => setView('calendar')} className={`p-2 px-3 flex items-center gap-1 text-sm ${view === 'calendar' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><Calendar size={16} /> Calendrier</button>
          </div>
        </div>

        {view === 'list' ? (
          <div className="medibook-card p-0 overflow-hidden"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="medibook-table-header"><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Début</th><th className="px-4 py-3 text-left">Fin</th><th className="px-4 py-3 text-left">Disponible</th><th className="px-4 py-3 text-left">Actions</th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="medibook-table-row">
                    <td className="px-4 py-3">{c.date}</td>
                    <td className="px-4 py-3 font-medium">{c.heureDebut}</td>
                    <td className="px-4 py-3">{c.heureFin}</td>
                    <td className="px-4 py-3"><span className={`medibook-badge ${c.disponible ? 'bg-status-active/15 text-status-active' : 'bg-status-cancelled/15 text-status-cancelled'}`}>{c.disponible ? 'Disponible' : 'Occupé'}</span></td>
                    <td className="px-4 py-3"><button onClick={() => toast.success('Créneau supprimé')} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></div>
        ) : (
          <div className="medibook-card">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {filtered.map(c => (
                <div key={c.id} className={`rounded-xl p-3 text-center text-xs font-medium border ${c.disponible ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-destructive/5 border-destructive/20 text-destructive'}`}>
                  <p className="font-semibold">{c.heureDebut}</p>
                  <p className="text-[10px]">{c.heureFin}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreneauxPage;
