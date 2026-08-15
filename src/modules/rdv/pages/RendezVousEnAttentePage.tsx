import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { rdvSecretaireService } from '@/modules/rdv/services/rdvService';
import type { RendezVous } from '@/modules/rdv/types/rdv.types';
import { RDV_ERREURS } from '@/modules/rdv/messages/rdv.erreurs';
import { RDV_SUCCES } from '@/modules/rdv/messages/rdv.succes';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  LayoutGrid, 
  List, 
  Search,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Phone,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const RendezVousEnAttentePage = () => {
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filterNom, setFilterNom] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchRdvs = useCallback(() => {
    setLoading(true);
    rdvSecretaireService.enAttente()
      .then(res => {
        const raw = (res.data as any)?.data;
        const data = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : [];
        setRdvs(data);
      })
      .catch(() => toast.error(RDV_ERREURS.CHARGEMENT_ECHOUE))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRdvs(); }, [fetchRdvs]);

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
    return rdvs.filter(rv => {
      const nom = `${rv.patientPrenom || ''} ${rv.patientNom || ''} ${rv.medecinPrenom || ''} ${rv.medecinNom || ''}`.toLowerCase();
      const matchNom = !filterNom || nom.includes(filterNom.toLowerCase());
      const matchDate = !filterDate || rv.date === filterDate;
      return matchNom && matchDate;
    });
  }, [rdvs, filterNom, filterDate]);

  if (loading && rdvs.length === 0) {
    return (
      <DashboardLayout title="Demandes en Attente">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Demandes en Attente">
      <div className="space-y-5">
        
        {/* Bandeau d'information léger (intégré au thème) */}
        <div className="medibook-card bg-card p-4 rounded-2xl border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {rdvs.length} demande(s) nécessitent votre validation
              </p>
              <p className="text-xs text-muted-foreground">
                Validez ou déclinez les réservations soumises par les patients.
              </p>
            </div>
          </div>

          <button
            onClick={fetchRdvs}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0"
            title="Actualiser"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Barre de Filtres & Contrôles */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Rechercher patient ou médecin..."
                value={filterNom}
                onChange={e => setFilterNom(e.target.value)}
                className="medibook-input w-full pl-9 text-xs font-medium"
              />
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="medibook-input text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex bg-muted/60 p-1 rounded-xl border border-border">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'grid' 
                    ? 'bg-card text-foreground shadow-2xs' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid size={14} />
                <span>Grille</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'list' 
                    ? 'bg-card text-foreground shadow-2xs' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List size={14} />
                <span>Liste</span>
              </button>
            </div>
          </div>
        </div>

        {/* État vide */}
        {filtered.length === 0 ? (
          <div className="medibook-card text-center py-16 border border-dashed border-border rounded-2xl space-y-2">
            <p className="text-sm font-bold text-foreground">
              {rdvs.length > 0 ? 'Aucun résultat pour ces filtres' : 'Aucune demande en attente'}
            </p>
            <p className="text-xs text-muted-foreground">
              {rdvs.length > 0 ? 'Modifiez votre recherche.' : 'Toutes les demandes de rendez-vous ont été traitées.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* === VUE GRILLE === */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(rv => (
              <div 
                key={rv.id} 
                className="medibook-card bg-card p-5 rounded-2xl border border-border hover:border-primary/40 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary font-bold text-base flex items-center justify-center shrink-0">
                      {rv.patientPrenom ? rv.patientPrenom[0] : <User size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">
                        {rv.patientPrenom} {rv.patientNom}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-medium">
                        <Stethoscope size={12} className="text-primary" />
                        Dr. {rv.medecinPrenom} {rv.medecinNom}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={rv.statut} />
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-semibold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-primary" />
                      {rv.date}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock size={13} />
                      {rv.heureDebut?.slice(0, 5)} — {rv.heureFin?.slice(0, 5)}
                    </span>
                  </div>

                  {rv.patientTelephone && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium pt-1 border-t border-border/30">
                      <Phone size={12} className="text-emerald-500" />
                      {rv.patientTelephone}
                    </p>
                  )}

                  {rv.motif && (
                    <p className="text-[11px] text-muted-foreground italic truncate">
                      « {rv.motif} »
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    disabled={actionLoading === rv.id}
                    onClick={() => handleConfirmer(rv.id)}
                    className="medibook-btn h-9 text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {actionLoading === rv.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    Confirmer
                  </button>

                  <button
                    disabled={actionLoading === rv.id}
                    onClick={() => handleAnnuler(rv.id)}
                    className="h-9 px-3 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {actionLoading === rv.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                    Décliner
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* === VUE LISTE === */
          <div className="medibook-card p-0 overflow-hidden rounded-2xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="medibook-table-header text-muted-foreground font-bold">
                    <th className="px-4 py-3 text-left">Date & Heure</th>
                    <th className="px-4 py-3 text-left">Patient</th>
                    <th className="px-4 py-3 text-left">Médecin</th>
                    <th className="px-4 py-3 text-left">Motif</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map(rv => (
                    <tr key={rv.id} className="medibook-table-row">
                      <td className="px-4 py-3 whitespace-nowrap font-semibold text-foreground">
                        <p>{rv.date}</p>
                        <p className="text-[11px] text-muted-foreground">{rv.heureDebut?.slice(0, 5)} - {rv.heureFin?.slice(0, 5)}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-bold text-foreground">{rv.patientPrenom} {rv.patientNom}</p>
                        {rv.patientTelephone && <p className="text-[11px] text-muted-foreground">{rv.patientTelephone}</p>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                        Dr. {rv.medecinPrenom} {rv.medecinNom}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate font-medium">
                        {rv.motif || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            disabled={actionLoading === rv.id}
                            onClick={() => handleConfirmer(rv.id)}
                            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                            title="Confirmer"
                          >
                            {actionLoading === rv.id ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                          </button>
                          <button
                            disabled={actionLoading === rv.id}
                            onClick={() => handleAnnuler(rv.id)}
                            className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                            title="Décliner"
                          >
                            {actionLoading === rv.id ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                          </button>
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

export default RendezVousEnAttentePage;
