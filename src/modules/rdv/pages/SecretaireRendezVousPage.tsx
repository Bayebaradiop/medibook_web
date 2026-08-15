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
      <div className="space-y-5">
        {/* Banner Synthèse */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="medibook-card p-3.5 flex items-center justify-between border border-border/80">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total RDV</p>
              <p className="text-lg font-bold text-foreground">{rdvs.length}</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">All</div>
          </div>
          <div className="medibook-card p-3.5 flex items-center justify-between border border-amber-500/20 bg-amber-500/5">
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">En attente</p>
              <p className="text-lg font-bold text-foreground">{rdvs.filter(r => r.statut === 'EN_ATTENTE').length}</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">⏳</div>
          </div>
          <div className="medibook-card p-3.5 flex items-center justify-between border border-emerald-500/20 bg-emerald-500/5">
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Confirmés</p>
              <p className="text-lg font-bold text-foreground">{rdvs.filter(r => r.statut === 'CONFIRME').length}</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">✓</div>
          </div>
          <div className="medibook-card p-3.5 flex items-center justify-between border border-teal-500/20 bg-teal-500/5">
            <div>
              <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">Terminés</p>
              <p className="text-lg font-bold text-foreground">{rdvs.filter(r => r.statut === 'TERMINE').length}</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">✓✓</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-3">
          <select value={filterMedecin} onChange={e => setFilterMedecin(e.target.value)} className="medibook-input text-xs h-10 min-w-[180px]">
            <option value="">Tous les médecins</option>
            {medecins.map(m => <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="medibook-input text-xs h-10">
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="CONFIRME">Confirmé</option>
            <option value="TERMINE">Terminé</option>
            <option value="ANNULE">Annulé</option>
          </select>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="medibook-input text-xs h-10" />
        </div>

        {filtered.length === 0 ? (
          <div className="medibook-card text-center py-16 text-muted-foreground text-sm">Aucun rendez-vous trouvé pour ces filtres.</div>
        ) : (
          <div className="medibook-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="medibook-table-header">
                    <th className="px-4 py-3 text-left">Date & Heure</th>
                    <th className="px-4 py-3 text-left">Médecin</th>
                    <th className="px-4 py-3 text-left">Patient</th>
                    <th className="px-4 py-3 text-left">Motif</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(rv => (
                    <tr key={rv.id} className="medibook-table-row hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{rv.date}</p>
                        <p className="text-xs text-muted-foreground">{rv.heureDebut?.slice(0, 5)} - {rv.heureFin?.slice(0, 5)}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">Dr. {rv.medecinPrenom} {rv.medecinNom}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{rv.patientPrenom} {rv.patientNom}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{rv.motif || 'Consultation'}</td>
                      <td className="px-4 py-3"><StatusBadge status={rv.statut} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {peutConfirmer(rv) && (
                            <button
                              disabled={actionLoading === rv.id}
                              onClick={() => handleConfirmer(rv.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                              title="Confirmer"
                            >
                              <CheckCircle size={14} /> Confirmer
                            </button>
                          )}
                          {peutAnnuler(rv) && (
                            <button
                              disabled={actionLoading === rv.id}
                              onClick={() => handleAnnuler(rv.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                              title="Annuler"
                            >
                              <XCircle size={14} /> Annuler
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SecretaireRendezVousPage;
