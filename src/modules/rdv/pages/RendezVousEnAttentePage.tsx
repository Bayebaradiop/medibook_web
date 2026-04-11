import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { rdvSecretaireService } from '@/modules/rdv/services/rdvService';
import type { RendezVous } from '@/modules/rdv/types/rdv.types';
import { RDV_ERREURS } from '@/modules/rdv/messages/rdv.erreurs';
import { RDV_SUCCES } from '@/modules/rdv/messages/rdv.succes';
import { AlertTriangle, CheckCircle, XCircle, Loader2, LayoutGrid, List, Search } from 'lucide-react';
import { toast } from 'sonner';

const RendezVousEnAttentePage = () => {
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filterNom, setFilterNom] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchRdvs = useCallback(() => {
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

  const filtered = rdvs.filter(rv => {
    const nom = `${rv.patientPrenom} ${rv.patientNom} ${rv.medecinPrenom} ${rv.medecinNom}`.toLowerCase();
    const matchNom = !filterNom || nom.includes(filterNom.toLowerCase());
    const matchDate = !filterDate || rv.date === filterDate;
    return matchNom && matchDate;
  });

  if (loading) {
    return (
      <DashboardLayout title="RDV en attente">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="RDV en attente">
      <div className="space-y-6">
        {/* Banner */}
        <div className="medibook-card bg-warning/10 border border-warning/20 flex items-center gap-3">
          <AlertTriangle className="text-warning shrink-0" size={24} />
          <div>
            <p className="font-semibold text-foreground">{rdvs.length} rendez-vous en attente</p>
            <p className="text-sm text-muted-foreground">Ces RDV nécessitent votre attention</p>
          </div>
        </div>

        {/* Filtres + toggle vue */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Rechercher par nom (patient ou médecin)..."
              value={filterNom}
              onChange={e => setFilterNom(e.target.value)}
              className="medibook-input text-sm pl-9 w-full"
            />
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="medibook-input text-sm"
          />
          <div className="flex border rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}
              title="Vue grille"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}
              title="Vue liste"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            {rdvs.length > 0 ? 'Aucun résultat pour ces filtres' : 'Aucun rendez-vous en attente'}
          </div>
        ) : viewMode === 'grid' ? (
          /* === VUE GRILLE === */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(rv => (
              <div key={rv.id} className="medibook-card border border-warning/20">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{rv.patientPrenom} {rv.patientNom}</p>
                    <p className="text-sm text-muted-foreground">Dr. {rv.medecinPrenom} {rv.medecinNom}</p>
                    {rv.patientTelephone && <p className="text-xs text-muted-foreground">📞 {rv.patientTelephone}</p>}
                  </div>
                  <StatusBadge status={rv.statut} />
                </div>
                <div className="text-sm text-muted-foreground space-y-1 mb-4">
                  <p>📅 {rv.date} — {rv.heureDebut?.slice(0, 5)} à {rv.heureFin?.slice(0, 5)}</p>
                  <p>📋 {rv.motif || '—'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={actionLoading === rv.id}
                    onClick={() => handleConfirmer(rv.id)}
                    className="medibook-btn h-10 px-4 text-sm flex-1 flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {actionLoading === rv.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Confirmer
                  </button>
                  <button
                    disabled={actionLoading === rv.id}
                    onClick={() => handleAnnuler(rv.id)}
                    className="h-10 px-4 text-sm font-semibold rounded-2xl bg-destructive text-card transition-all duration-200 active:scale-[0.98] hover:brightness-90 flex-1 flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {actionLoading === rv.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />} Annuler
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* === VUE LISTE === */
          <div className="medibook-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="medibook-table-header">
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Heure</th>
                    <th className="px-4 py-3 text-left">Patient</th>
                    <th className="px-4 py-3 text-left">Médecin</th>
                    <th className="px-4 py-3 text-left">Motif</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(rv => (
                    <tr key={rv.id} className="medibook-table-row">
                      <td className="px-4 py-3 whitespace-nowrap">{rv.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{rv.heureDebut?.slice(0, 5)} - {rv.heureFin?.slice(0, 5)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{rv.patientPrenom} {rv.patientNom}</p>
                        {rv.patientTelephone && <p className="text-xs text-muted-foreground">{rv.patientTelephone}</p>}
                      </td>
                      <td className="px-4 py-3">Dr. {rv.medecinPrenom} {rv.medecinNom}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{rv.motif || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            disabled={actionLoading === rv.id}
                            onClick={() => handleConfirmer(rv.id)}
                            className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                            title="Confirmer"
                          >
                            {actionLoading === rv.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                          </button>
                          <button
                            disabled={actionLoading === rv.id}
                            onClick={() => handleAnnuler(rv.id)}
                            className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                            title="Annuler"
                          >
                            {actionLoading === rv.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
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
