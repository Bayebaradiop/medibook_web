import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { mockMedecins } from '@/data/mockUsers';
import { DAYS_OF_WEEK } from '@/utils/constants';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const durations = [15, 20, 30, 45, 60];

const PlanningFormPage = () => {
  const navigate = useNavigate();
  const [medecinId, setMedecinId] = useState('m1');
  const [jour, setJour] = useState('LUNDI');
  const [heureDebut, setHeureDebut] = useState('08:00');
  const [heureFin, setHeureFin] = useState('12:00');
  const [duree, setDuree] = useState(30);

  const preview = useMemo(() => {
    const slots: string[] = [];
    const [sh, sm] = heureDebut.split(':').map(Number);
    const [eh, em] = heureFin.split(':').map(Number);
    let current = sh * 60 + sm;
    const end = eh * 60 + em;
    while (current + duree <= end) {
      const h = Math.floor(current / 60).toString().padStart(2, '0');
      const m = (current % 60).toString().padStart(2, '0');
      const h2 = Math.floor((current + duree) / 60).toString().padStart(2, '0');
      const m2 = ((current + duree) % 60).toString().padStart(2, '0');
      slots.push(`${h}:${m} - ${h2}:${m2}`);
      current += duree;
    }
    return slots;
  }, [heureDebut, heureFin, duree]);

  return (
    <DashboardLayout title="Nouveau Planning">
      <div className="space-y-6 max-w-3xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={18} /> Retour</button>

        <form onSubmit={e => { e.preventDefault(); toast.success('Planning créé'); navigate('/secretaire/plannings'); }} className="space-y-6">
          <div className="medibook-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Médecin</label><select value={medecinId} onChange={e => setMedecinId(e.target.value)} className="medibook-input w-full">{mockMedecins.map(m => <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>)}</select></div>
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Jour</label><select value={jour} onChange={e => setJour(e.target.value)} className="medibook-input w-full">{DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Heure début</label><input type="time" value={heureDebut} onChange={e => setHeureDebut(e.target.value)} className="medibook-input w-full" /></div>
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Heure fin</label><input type="time" value={heureFin} onChange={e => setHeureFin(e.target.value)} className="medibook-input w-full" /></div>
              <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Durée créneau (min)</label><select value={duree} onChange={e => setDuree(Number(e.target.value))} className="medibook-input w-full">{durations.map(d => <option key={d} value={d}>{d} minutes</option>)}</select></div>
            </div>
          </div>

          {preview.length > 0 && (
            <div className="medibook-card">
              <h3 className="font-semibold mb-3">Aperçu des créneaux ({preview.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {preview.map((slot, i) => (
                  <div key={i} className="bg-primary/5 text-primary text-xs font-medium rounded-lg p-2 text-center border border-primary/10">{slot}</div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="medibook-btn-outline">Annuler</button>
            <button type="submit" className="medibook-btn">Créer le planning</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PlanningFormPage;
