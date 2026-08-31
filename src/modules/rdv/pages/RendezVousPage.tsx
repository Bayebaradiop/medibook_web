import { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import StatusBadge from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/SkeletonLoaders";
import { CheckCircle, Check, Loader2, Calendar, Clock, Filter, X, User } from "lucide-react";
import { toast } from "sonner";
import type { RdvStatut, RendezVous } from "../types/rdv.types";
import { rdvMedecinService } from "../services/rdvService";
import { RDV_ERREURS } from "../messages/rdv.erreurs";
import { RDV_SUCCES } from "../messages/rdv.succes";
import { peutTerminer } from "../logique/rdv.regles";
import { formatDateFR } from "@/utils/date";

const hasDataProperty = (value: unknown): value is { data: unknown } =>
  typeof value === "object" && value !== null && "data" in value;

const extraireListe = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (hasDataProperty(value)) {
    if (Array.isArray(value.data)) return value.data as T[];
    const inner = value.data as Record<string, unknown>;
    if (inner && typeof inner === 'object' && Array.isArray(inner.content)) return inner.content as T[];
  }
  return [];
};

const RendezVousPage = () => {
  // Par défaut, afficher les rendez-vous CONFIRMES (À venir)
  const [activeTab, setActiveTab] = useState<RdvStatut | "ALL">("CONFIRME");
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const navigate = useNavigate();

  const fetchRdvs = useCallback(() => {
    setLoading(true);
    rdvMedecinService.list()
      .then((res) => setRdvs(extraireListe<RendezVous>(res.data)))
      .catch(() => toast.error(RDV_ERREURS.CHARGEMENT_ECHOUE))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRdvs();
  }, [fetchRdvs]);

  const handleTerminer = async (id: number) => {
    setActionLoading(id);
    try {
      await rdvMedecinService.terminer(id);
      toast.success(RDV_SUCCES.TERMINE);
      fetchRdvs();
    } catch {
      toast.error(RDV_ERREURS.CLOTURE_ECHOUEE);
    } finally {
      setActionLoading(null);
    }
  };

  // Compteurs par statut
  const stats = useMemo(() => {
    return {
      confirmes: rdvs.filter(r => r.statut === 'CONFIRME').length,
      termines: rdvs.filter(r => r.statut === 'TERMINE').length,
      annules: rdvs.filter(r => r.statut === 'ANNULE').length,
      total: rdvs.length,
    };
  }, [rdvs]);

  // Filtrage et Tri intelligent
  const filteredRdvs = useMemo(() => {
    const list = rdvs.filter((r) => {
      const matchTab = activeTab === "ALL" || r.statut === activeTab;
      const matchDate = !dateFilter || r.date === dateFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || [
        r.patientPrenom,
        r.patientNom,
        r.patientTelephone,
        r.motif
      ].some(f => f?.toLowerCase().includes(q));
      return matchTab && matchDate && matchSearch;
    });

    // Tri selon l'onglet
    return list.sort((a, b) => {
      if (activeTab === "CONFIRME") {
        // Du plus proche au plus éloigné dans le temps (Date ASC, Heure ASC)
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.heureDebut || "").localeCompare(b.heureDebut || "");
      } else {
        // Pour les terminés ou annulés : plus récents en premier (Date DESC, Heure DESC)
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return (b.heureDebut || "").localeCompare(a.heureDebut || "");
      }
    });
  }, [rdvs, activeTab, dateFilter, searchQuery]);

  if (loading && rdvs.length === 0) {
    return (
      <DashboardLayout title="Mes Rendez-vous">
        <TableSkeleton rows={6} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mes Rendez-vous">
      <div className="space-y-6">

        {/* Header synthétique */}
        <div className="medibook-card bg-card p-5 rounded-3xl border border-border/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Calendar size={22} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-foreground">Agenda des Consultations</h1>
              <p className="text-xs text-muted-foreground font-medium">
                {stats.confirmes} rendez-vous actif(s) à honorer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Rechercher patient..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="medibook-input w-full text-xs pl-8 pr-7 h-9 rounded-xl"
              />
              <Filter className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={12} />
                </button>
              )}
            </div>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="medibook-input text-xs h-9 rounded-xl"
            />
          </div>
        </div>

        {/* Système d'Onglets de Priorité Visuelle */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border/70">
          
          {/* Onglet 1: Confirmés / À venir (Par Défaut) */}
          <button
            onClick={() => setActiveTab("CONFIRME")}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "CONFIRME"
                ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle size={15} className={activeTab === "CONFIRME" ? "text-emerald-500" : ""} />
            <span>📅 À venir & Confirmés</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === "CONFIRME" ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
            }`}>
              {stats.confirmes}
            </span>
          </button>

          {/* Onglet 2: Terminés */}
          <button
            onClick={() => setActiveTab("TERMINE")}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "TERMINE"
                ? "bg-card text-sky-600 dark:text-sky-400 shadow-xs border border-sky-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Check size={15} className={activeTab === "TERMINE" ? "text-sky-500" : ""} />
            <span>✅ Historique (Terminés)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === "TERMINE" ? "bg-sky-500/20 text-sky-600 dark:text-sky-400" : "bg-muted text-muted-foreground"
            }`}>
              {stats.termines}
            </span>
          </button>

          {/* Onglet 3: Annulés */}
          <button
            onClick={() => setActiveTab("ANNULE")}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "ANNULE"
                ? "bg-card text-rose-600 dark:text-rose-400 shadow-xs border border-rose-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <X size={15} className={activeTab === "ANNULE" ? "text-rose-500" : ""} />
            <span>🚫 Annulés</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === "ANNULE" ? "bg-rose-500/20 text-rose-600 dark:text-rose-400" : "bg-muted text-muted-foreground"
            }`}>
              {stats.annules}
            </span>
          </button>

          {/* Onglet 4: Tous */}
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ml-auto ${
              activeTab === "ALL"
                ? "bg-card text-primary shadow-xs border border-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Tous ({stats.total})</span>
          </button>

        </div>

        {/* Tableau des Rendez-vous */}
        {filteredRdvs.length === 0 ? (
          <div className="medibook-card bg-card text-center py-16 text-muted-foreground text-xs rounded-3xl border border-dashed border-border space-y-2">
            <p className="font-bold text-foreground text-sm">Aucun rendez-vous dans cet onglet</p>
            <p className="text-muted-foreground">
              {activeTab === 'CONFIRME' && 'Vous n’avez aucun rendez-vous à venir pour cette sélection.'}
              {activeTab === 'TERMINE' && 'Aucune consultation clôturée dans l’historique.'}
              {activeTab === 'ANNULE' && 'Aucun rendez-vous annulé.'}
              {activeTab === 'ALL' && 'Aucun résultat correspondant aux filtres.'}
            </p>
          </div>
        ) : (
          <div className="medibook-card p-0 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="medibook-table-header text-muted-foreground font-bold border-b border-border/80 bg-muted/40">
                    <th className="px-5 py-4 text-left">Date & Créneau</th>
                    <th className="px-5 py-4 text-left">Patient</th>
                    <th className="px-5 py-4 text-left">Motif Consultation</th>
                    <th className="px-5 py-4 text-center">Statut</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredRdvs.map((rv) => (
                    <tr
                      key={rv.id}
                      className="medibook-table-row cursor-pointer hover:bg-muted/30 transition-colors group"
                      onClick={() => navigate(`/medecin/rendez-vous/${rv.id}`)}
                    >
                      {/* Date & Heure */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-bold text-foreground">{formatDateFR(rv.date)}</p>
                        <p className="text-[11px] font-semibold text-primary flex items-center gap-1 mt-0.5">
                          <Clock size={12} />
                          {rv.heureDebut?.slice(0, 5)} — {rv.heureFin?.slice(0, 5)}
                        </p>
                      </td>

                      {/* Patient */}
                      <td className="px-5 py-4 whitespace-nowrap font-bold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-extrabold text-xs flex items-center justify-center">
                            {rv.patientPrenom?.[0] || <User size={14} />}
                          </div>
                          <div>
                            <p className="group-hover:text-primary transition-colors">
                              {[rv.patientPrenom, rv.patientNom].filter(Boolean).join(" ") || "Patient"}
                            </p>
                            {rv.patientTelephone && (
                              <p className="text-[11px] text-muted-foreground font-normal">{rv.patientTelephone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Motif */}
                      <td className="px-5 py-4 text-muted-foreground font-medium max-w-[220px] truncate">
                        {rv.motif || "Consultation médicale"}
                      </td>

                      {/* Statut */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <StatusBadge status={rv.statut} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          {peutTerminer(rv) && (
                            <button
                              disabled={actionLoading === rv.id}
                              onClick={() => handleTerminer(rv.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                              title="Marquer comme consulté / terminé"
                            >
                              {actionLoading === rv.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                              <span>Clôturer Consultation</span>
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

export default RendezVousPage;
