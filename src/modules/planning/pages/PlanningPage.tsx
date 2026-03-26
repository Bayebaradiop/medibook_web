import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { DAYS_OF_WEEK } from '@/utils/constants';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { planningService } from '@/modules/planning/services/planningService';
import { secretaireMedecinsService } from '@/modules/utilisateur/services/utilisateurService';
import type { Planning } from '@/modules/planning/types/planning.types';
import type { Medecin } from '@/modules/utilisateur/types/utilisateur.types';

const HOURS = Array.from({ length: 12 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

const SecretairePlanningPage = () => {
  const navigate = useNavigate();
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [selectedMedecin, setSelectedMedecin] = useState<number | null>(null);
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Charger les médecins
  useEffect(() => {
    const chargerMedecins = async () => {
      try {
        const res = await secretaireMedecinsService.list();
        const data = (res.data as any)?.data || res.data;
        const liste = Array.isArray(data) ? data : [];
        setMedecins(liste);
        if (liste.length > 0) setSelectedMedecin(liste[0].id);
      } catch {
        toast.error('Erreur lors du chargement des médecins');
      } finally {
        setLoading(false);
      }
    };
    chargerMedecins();
  }, []);

  // Charger les plannings quand le médecin change
  useEffect(() => {
    if (!selectedMedecin) return;
    const chargerPlannings = async () => {
      try {
        const res = await planningService.listParMedecin(selectedMedecin);
        const data = (res.data as any)?.data || res.data;
        setPlannings(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Erreur lors du chargement des plannings');
      }
    };
    chargerPlannings();
  }, [selectedMedecin]);

  const handleDelete = async () => {
    if (!deleteId || !selectedMedecin) return;
    try {
      await planningService.delete(deleteId);
      toast.success('Planning supprimé');
      setDeleteId(null);
      // Recharger les plannings
      const res = await planningService.listParMedecin(selectedMedecin);
      const data = (res.data as any)?.data || res.data;
      setPlannings(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) return (
    <DashboardLayout title="Plannings">
      <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Plannings">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <select
            value={selectedMedecin ?? ''}
            onChange={e => setSelectedMedecin(Number(e.target.value))}
            className="medibook-input text-sm"
          >
            {medecins.map(m => <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>)}
          </select>
          <button onClick={() => navigate('/secretaire/plannings/nouveau')} className="medibook-btn flex items-center gap-2"><Plus size={18} /> Nouveau Planning</button>
        </div>

        <div className="medibook-card p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead><tr className="medibook-table-header"><th className="px-2 py-3 w-16"></th>{DAYS_OF_WEEK.map(d => <th key={d} className="px-2 py-3 text-center">{d.slice(0, 3)}</th>)}</tr></thead>
            <tbody>
              {HOURS.map(hour => (
                <tr key={hour} className="border-b border-border">
                  <td className="px-2 py-3 text-xs text-muted-foreground">{hour}</td>
                  {DAYS_OF_WEEK.map(day => {
                    const planning = plannings.find(p => p.jourSemaine === day && p.heureDebut <= hour && p.heureFin > hour);
                    return (
                      <td key={day} className="px-1 py-1">
                        {planning && planning.heureDebut === hour && (
                          <div className="bg-primary/10 text-primary rounded-lg p-2 text-xs font-medium border-l-2 border-primary">
                            <p>{planning.heureDebut}-{planning.heureFin}</p>
                            <p className="text-[10px] text-muted-foreground">{planning.dureeCreneau}min</p>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="medibook-card">
          <h3 className="font-semibold mb-4">Liste des plannings</h3>
          {plannings.length > 0 ? (
            <div className="space-y-2">
              {plannings.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <div><p className="text-sm font-medium">{p.jourSemaine}</p><p className="text-xs text-muted-foreground">{p.heureDebut} - {p.heureFin} · {p.dureeCreneau}min</p></div>
                  <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun planning pour ce médecin</p>
          )}
        </div>
      </div>

      <ConfirmDialog open={!!deleteId} title="Supprimer le planning" message="Êtes-vous sûr de vouloir supprimer ce planning ?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} confirmLabel="Supprimer" />
    </DashboardLayout>
  );
};

export default SecretairePlanningPage;
