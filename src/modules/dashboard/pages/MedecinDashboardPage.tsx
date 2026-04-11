import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import StatsCard from "@/components/common/StatsCard";
import StatusBadge from "@/components/common/StatusBadge";
import { CalendarDays, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { rdvMedecinService } from "@/modules/rdv/services/rdvService";
import { statsService } from "@/modules/stats/services/statsService";
import type { RendezVous } from "@/modules/rdv/types/rdv.types";
import type { StatsMedecin } from "@/modules/stats/types/stats.types";
import { STATS_ERREURS } from "@/modules/stats/messages/stats.erreurs";
import { toast } from "sonner";

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

const extraireObjet = <T,>(value: unknown): T | null => {
  if (hasDataProperty(value) && typeof value.data === "object" && value.data !== null) {
    return value.data as T;
  }
  if (typeof value === "object" && value !== null) return value as T;
  return null;
};

const toIsoDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const MedecinDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsMedecin | null>(null);
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);

  useEffect(() => {
    const charger = async () => {
      try {
        const [statsRes, rdvRes] = await Promise.all([
          statsService.medecin(),
          rdvMedecinService.list(),
        ]);
        setStats(extraireObjet<StatsMedecin>(statsRes.data));
        setRdvs(extraireListe<RendezVous>(rdvRes.data));
      } catch {
        toast.error(STATS_ERREURS.CHARGEMENT_ECHOUE);
      } finally {
        setLoading(false);
      }
    };

    charger();
  }, []);

  const todayIso = useMemo(() => toIsoDate(new Date()), []);

  const todayRdvs = useMemo(
    () =>
      rdvs
        .filter((r) => r.date === todayIso)
        .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut)),
    [rdvs, todayIso]
  );

  const weekData = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - 6 + i);
        const iso = toIsoDate(d);
        return {
          jour: DAY_LABELS[d.getDay()],
          rdv: rdvs.filter((r) => r.date === iso).length,
        };
      }),
    [rdvs]
  );

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout title="Dashboard">
        <p className="text-center text-muted-foreground py-12">Impossible de charger le dashboard</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div className="medibook-card bg-gradient-to-r from-primary-dark to-primary-light">
          <h2 className="text-xl font-bold text-primary-foreground">Bonjour Dr. {user?.nom} 👋</h2>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Vous avez {todayRdvs.length} rendez-vous aujourd&apos;hui
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard icon={CalendarDays} value={stats.totalRdv} label="Total RDV" color="green" />
          <StatsCard icon={Clock} value={stats.rdvEnAttente} label="En attente" color="orange" />
          <StatsCard icon={CheckCircle} value={stats.rdvConfirmes} label="Confirmés" color="blue" />
          <StatsCard icon={XCircle} value={stats.rdvTermines} label="Terminés" color="grey" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="medibook-card">
            <h3 className="font-semibold mb-4">Prochains RDV du jour</h3>
            <div className="space-y-3">
              {todayRdvs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun RDV aujourd&apos;hui</p>
              ) : (
                todayRdvs.map((rv) => (
                  <div key={rv.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">
                        {[rv.patientPrenom, rv.patientNom].filter(Boolean).join(" ") || "Patient"}
                      </p>
                      <p className="text-xs text-muted-foreground">{rv.motif || "Consultation"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {rv.heureDebut.slice(0, 5)} - {rv.heureFin.slice(0, 5)}
                      </p>
                      <StatusBadge status={rv.statut} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="medibook-card">
            <h3 className="font-semibold mb-4">Évolution des RDV (7 jours)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,88%)" />
                <XAxis dataKey="jour" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="rdv"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MedecinDashboard;
