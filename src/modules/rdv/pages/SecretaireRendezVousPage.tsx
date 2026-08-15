import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { rdvSecretaireService } from '@/modules/rdv/services/rdvService';
import { secretaireMedecinsService } from '@/modules/utilisateur/services/utilisateurService';
import type { RendezVous } from '@/modules/rdv/types/rdv.types';
import type { Medecin } from '@/modules/utilisateur/types/utilisateur.types';
import { RDV_ERREURS } from '@/modules/rdv/messages/rdv.erreurs';
import { RDV_SUCCES } from '@/modules/rdv/messages/rdv.succes';
import { peutConfirmer, peutAnnuler } from '@/modules/rdv/logique/rdv.regles';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Search, 
  Calendar, 
  Clock, 
  Filter, 
  RefreshCw,
  CheckCircle2,
  ListFilter
} from 'lucide-react';
import { toast } from 'sonner';

const SecretaireRendezVousPage = () => {
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filterMedecin, setFilterMedecin] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRdvs = useCallback(() => {
    setLoading(true);
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
    } catch { 
      toast.error(RDV_ERREURS.CONFIRMATION_ECHOUEE); 
    } finally { 
      setActionLoading(null); 
    }
  };

  const handleAnnuler = async (id: number) => {
    setActionLoading(id);
    try {
      await rdvSecretaireService.annuler(id);
      toast.success(RDV_SUCCES.ANNULE);
      fetchRdvs();
    } catch { 
      toast.error(RDV_ERREURS.ANNULATION_ECHOUEE); 
    } finally { 
      setActionLoading(null); 
    }
  };

  const filtered = useMemo(() => {
    return rdvs.filter(r => {
      const mm = !filterMedecin || r.medecinId === Number(filterMedecin);
      const ms = !filterStatus || r.statut === filterStatus;
      const md = !filterDate || r.date === filterDate;
      const matchSearch = !searchQuery || 
        `${r.patientPrenom} ${r.patientNom} ${r.medecinPrenom} ${r.medecinNom} ${r.motif}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return mm && ms && md && matchSearch;
    });
  }, [rdvs, filterMedecin, filterStatus, filterDate, searchQuery]);

  if (loading && rdvs.length === 0) {
    return (
      <DashboardLayout title="Registre des Rendez-Vous">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Registre des Rendez-Vous">
      <div className="space-y-5">
        
        {/* Cartes Métriques Thématiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="medibook-card bg-card p-4 rounded-2xl border border-border flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total RDV</p>
              <p className="text-xl font-extrabold text-foreground mt-0.5">{rdvs.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Calendar size={18} />
            </div>
          </div>

          <div className="medibook-card bg-card p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">En Attente</p>
              <p className="text-xl font-extrabold text-foreground mt-0.5">{rdvs.filter(r => r.statut === 'EN_ATTENTE').length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Clock size={18} />
            </div>
          </div>

          <div className="medibook-card bg-card p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Confirmés</p>
              <p className="text-xl font-extrabold text-foreground mt-0.5">{rdvs.filter(r => r.statut === 'CONFIRME').length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 size={18} />
            </div>
          </div>

          <div className="medibook-card bg-card p-4 rounded-2xl border border-border flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Terminés</p>
              <p className="text-xl font-extrabold text-foreground mt-0.5">{rdvs.filter(r => r.statut === 'TERMINE').length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs">
              ✓✓
            </div>
          </div>
        </div>

        {/* Barre de Filtres Multiples */}
        <div className="medibook-card bg-card p-4 rounded-2xl border border-border space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5"><Filter size={14} className="text-primary" /> Filtrer les rendez-vous</span>
            <div className="flex items-center gap-2">
              <span>{filtered.length} résultat(s)</span>
              <button
                onClick={fetchRdvs}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                title="Actualiser"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Patient, médecin, motif..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="medibook-input w-full pl-9 text-xs"
              />
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <select 
              value={filterMedecin} 
              onChange={e => setFilterMedecin(e.target.value)} 
              className="medibook-input text-xs font-medium bg-card text-foreground cursor-pointer"
            >
              <option value="" className="bg-card text-foreground">Tous les médecins</option>
              {medecins.map(m => (
                <option key={m.id} value={m.id} className="bg-card text-foreground">
                  Dr. {m.prenom} {m.nom}
                </option>
              ))}
            </select>

            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)} 
              className="medibook-input text-xs font-medium bg-card text-foreground cursor-pointer"
            >
              <option value="" className="bg-card text-foreground">Tous les statuts</option>
              <option value="EN_ATTENTE" className="bg-card text-foreground">⏳ En attente</option>
              <option value="CONFIRME" className="bg-card text-foreground">✓ Confirmé</option>
              <option value="TERMINE" className="bg-card text-foreground">✓✓ Terminé</option>
              <option value="ANNULE" className="bg-card text-foreground">✕ Annulé</option>
            </select>

            <input 
              type="date" 
              value={filterDate} 
              onChange={e => setFilterDate(e.target.value)} 
              className="medibook-input text-xs font-medium" 
            />
          </div>
        </div>

        {/* Tableau des RDV */}
        {filtered.length === 0 ? (
          <div className="medibook-card text-center py-16 border border-dashed border-border rounded-2xl space-y-2">
            <ListFilter className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-bold text-foreground">Aucun rendez-vous trouvé</p>
            <p className="text-xs text-muted-foreground">Modifiez vos filtres de recherche.</p>
          </div>
        ) : (
          <div className="medibook-card p-0 overflow-hidden rounded-2xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="medibook-table-header text-muted-foreground font-semibold">
                    <th className="px-4 py-3 text-left">Date & Heure</th>
                    <th className="px-4 py-3 text-left">Médecin</th>
                    <th className="px-4 py-3 text-left">Patient</th>
                    <th className="px-4 py-3 text-left">Motif</th>
                    <th className="px-4 py-3 text-center">Statut</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map(rv => (
                    <tr key={rv.id} className="medibook-table-row hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-foreground">
                        <p>{rv.date}</p>
                        <p className="text-[11px] text-muted-foreground">{rv.heureDebut?.slice(0, 5)} - {rv.heureFin?.slice(0, 5)}</p>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-foreground whitespace-nowrap">
                        Dr. {rv.medecinPrenom} {rv.medecinNom}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="font-bold text-foreground">{rv.patientPrenom} {rv.patientNom}</p>
                        {rv.patientTelephone && <p className="text-[11px] text-muted-foreground">{rv.patientTelephone}</p>}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground max-w-[180px] truncate font-medium">
                        {rv.motif || 'Consultation'}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <StatusBadge status={rv.statut} />
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {peutConfirmer(rv) && (
                            <button
                              disabled={actionLoading === rv.id}
                              onClick={() => handleConfirmer(rv.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                              title="Confirmer"
                            >
                              {actionLoading === rv.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                              <span>Confirmer</span>
                            </button>
                          )}
                          {peutAnnuler(rv) && (
                            <button
                              disabled={actionLoading === rv.id}
                              onClick={() => handleAnnuler(rv.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                              title="Annuler"
                            >
                              {actionLoading === rv.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                              <span>Annuler</span>
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
