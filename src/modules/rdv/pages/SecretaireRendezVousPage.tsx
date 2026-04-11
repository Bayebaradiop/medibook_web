import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { rdvSecretaireService } from '@/modules/rdv/services/rdvService';
import { secretaireMedecinsService } from '@/modules/utilisateur/services/utilisateurService';
import type { RendezVous } from '@/modules/rdv/types/rdv.types';
import type { Medecin } from '@/modules/utilisateur/types/utilisateur.types';
import { RDV_ERREURS } from '@/modules/rdv/messages/rdv.erreurs';
import { RDV_SUCCES } from '@/modules/rdv/messages/rdv.succes';
import { peutConfirmer, peutAnnuler } from '@/modules/rdv/logique/rdv.regles';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SecretaireRendezVousPage = () => {
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filterMedecin, setFilterMedecin] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchRdvs = useCallback(() => {
    rdvSecretaireService.list()
      .then(res => {
        const raw = (res.data as any)?.data;
        const data = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : [];
        setRdvs(data);
      })
      .catch(() => toast.error(RDV_ERREURS.CHARGEMENT_ECHOUE))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRdvs();
    secretaireMedecinsService.list()
      .then(res => {
        const raw = (res.data as any)?.data;
        const data = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : [];
        setMedecins(data);
      })
      .catch(() => {});
  }, [fetchRdvs]);

  const handleConfirmer = async (id: number) => {
    setActionLoading(id);
    try {
      await rdvSecretaireService.confirmer(id);
      toast.success(RDV_SUCCES.CONFIRME);
      fetchRdvs();
    } catch { toast.error(RDV_ERREURS.CONFIRMATION_ECHOUEE); }
    finally { setActionLoading(null); }
  };

  const handleAnnuler = async (id: number) => {
    setActionLoading(id);
    try {
      await rdvSecretaireService.annuler(id);
      toast.success(RDV_SUCCES.ANNULE);
      fetchRdvs();
    } catch { toast.error(RDV_ERREURS.ANNULATION_ECHOUEE); }
    finally { setActionLoading(null); }
  };

  const filtered = rdvs.filter(r => {
    const mm = !filterMedecin || r.medecinId === Number(filterMedecin);
    const ms = !filterStatus || r.statut === filterStatus;
    const md = !filterDate || r.date === filterDate;
    return mm && ms && md;
  });

  if (loading) {
    return (
      <DashboardLayout title="Rendez-vous">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Rendez-vous">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <select value={filterMedecin} onChange={e => setFilterMedecin(e.target.value)} className="medibook-input text-sm">
            <option value="">Tous les médecins</option>
            {medecins.map(m => <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>)}
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

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Aucun rendez-vous trouvé</div>
        ) : (
        <div className="medibook-card p-0 overflow-hidden"><div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="medibook-table-header"><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Heure</th><th className="px-4 py-3 text-left">Médecin</th><th className="px-4 py-3 text-left">Patient</th><th className="px-4 py-3 text-left">Motif</th><th className="px-4 py-3 text-left">Statut</th><th className="px-4 py-3 text-left">Actions</th></tr></thead>
            <tbody>
              {filtered.map(rv => (
                <tr key={rv.id} className="medibook-table-row">
                  <td className="px-4 py-3">{rv.date}</td>
                  <td className="px-4 py-3 font-medium">{rv.heureDebut?.slice(0, 5)} - {rv.heureFin?.slice(0, 5)}</td>
                  <td className="px-4 py-3">Dr. {rv.medecinPrenom} {rv.medecinNom}</td>
                  <td className="px-4 py-3 font-medium">{rv.patientPrenom} {rv.patientNom}</td>
                  <td className="px-4 py-3 text-muted-foreground">{rv.motif || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={rv.statut} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {peutConfirmer(rv) && <button disabled={actionLoading === rv.id} onClick={() => handleConfirmer(rv.id)} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"><CheckCircle size={16} /></button>}
                      {peutAnnuler(rv) && <button disabled={actionLoading === rv.id} onClick={() => handleAnnuler(rv.id)} className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"><XCircle size={16} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SecretaireRendezVousPage;
