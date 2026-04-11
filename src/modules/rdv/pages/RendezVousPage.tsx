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
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1">
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  tab === t.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card hover:bg-muted text-muted-foreground"
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
            className="medibook-input text-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Aucun rendez-vous trouvé</div>
        ) : (
          <div className="medibook-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="medibook-table-header">
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Heure</th>
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
                      className="medibook-table-row cursor-pointer"
                      onClick={() => navigate(`/medecin/rendez-vous/${rv.id}`)}
                    >
                      <td className="px-4 py-3">{rv.date}</td>
                      <td className="px-4 py-3 font-medium">
                        {rv.heureDebut?.slice(0, 5)} - {rv.heureFin?.slice(0, 5)}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {[rv.patientPrenom, rv.patientNom].filter(Boolean).join(" ") || "Patient"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{rv.motif || "—"}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={rv.statut} />
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          {peutConfirmer(rv) && (
                            <button
                              disabled={actionLoading === rv.id}
                              onClick={() => handleConfirmer(rv.id)}
                              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                              title="Confirmer"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {peutTerminer(rv) && (
                            <button
                              disabled={actionLoading === rv.id}
                              onClick={() => handleTerminer(rv.id)}
                              className="p-2 rounded-lg bg-info/10 text-info hover:bg-info/20 transition-colors disabled:opacity-50"
                              title="Terminer"
                            >
                              <Check size={16} />
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
