import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import StatusBadge from "@/components/common/StatusBadge";
import { CheckCircle, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { RdvStatut, RendezVous } from "../types/rdv.types";
import { rdvMedecinService } from "../services/rdvService";
import { RDV_ERREURS } from "../messages/rdv.erreurs";
import { RDV_SUCCES } from "../messages/rdv.succes";
import { peutConfirmer, peutTerminer } from "../logique/rdv.regles";

const tabs: { label: string; value: "ALL" | RdvStatut }[] = [
  { label: "Tous", value: "ALL" },
  { label: "En attente", value: "EN_ATTENTE" },
  { label: "Confirmés", value: "CONFIRME" },
  { label: "Terminés", value: "TERMINE" },
  { label: "Annulés", value: "ANNULE" },
];

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
  const [tab, setTab] = useState<"ALL" | RdvStatut>("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const navigate = useNavigate();

  const fetchRdvs = useCallback(() => {
    rdvMedecinService.list()
      .then((res) => setRdvs(extraireListe<RendezVous>(res.data)))
      .catch(() => toast.error(RDV_ERREURS.CHARGEMENT_ECHOUE))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRdvs();
  }, [fetchRdvs]);

  const handleConfirmer = async (id: number) => {
    setActionLoading(id);
    try {
      await rdvMedecinService.confirmer(id);
      toast.success(RDV_SUCCES.CONFIRME);
      fetchRdvs();
    } catch {
      toast.error(RDV_ERREURS.CONFIRMATION_ECHOUEE);
    } finally {
      setActionLoading(null);
    }
  };

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

  const filtered = rdvs.filter((r) => {
    const matchTab = tab === "ALL" || r.statut === tab;
    const matchDate = !dateFilter || r.date === dateFilter;
    return matchTab && matchDate;
  });

  if (loading) {
    return (
      <DashboardLayout title="Mes Rendez-vous">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mes Rendez-vous">
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border/80">
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  tab === t.value
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="medibook-input text-xs h-10"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="medibook-card text-center py-16 text-muted-foreground text-sm">Aucun rendez-vous trouvé pour ces critères.</div>
        ) : (
          <div className="medibook-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="medibook-table-header">
                    <th className="px-4 py-3 text-left">Date & Heure</th>
                    <th className="px-4 py-3 text-left">Patient</th>
                    <th className="px-4 py-3 text-left">Motif</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rv) => (
                    <tr
                      key={rv.id}
                      className="medibook-table-row cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/medecin/rendez-vous/${rv.id}`)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{rv.date}</p>
                        <p className="text-xs text-muted-foreground">{rv.heureDebut?.slice(0, 5)} - {rv.heureFin?.slice(0, 5)}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {[rv.patientPrenom, rv.patientNom].filter(Boolean).join(" ") || "Patient"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{rv.motif || "Consultation médicale"}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={rv.statut} />
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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
                          {peutTerminer(rv) && (
                            <button
                              disabled={actionLoading === rv.id}
                              onClick={() => handleTerminer(rv.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-info/10 text-info hover:bg-info/20 text-xs font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                              title="Terminer"
                            >
                              <Check size={14} /> Clôturer
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
