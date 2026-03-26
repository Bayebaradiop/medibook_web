import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import StatsCard from "@/components/common/StatsCard";
import { CalendarDays, Clock, CheckCircle, XCircle, Users, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { statsService } from "../services/statsService";
import type { StatsMedecin } from "../types/stats.types";
import { STATS_ERREURS } from "../messages/stats.erreurs";

const hasDataProperty = (value: unknown): value is { data: unknown } =>
  typeof value === "object" && value !== null && "data" in value;

const StatsPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsMedecin | null>(null);

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await statsService.medecin();
        const payload = hasDataProperty(res.data) ? res.data.data : res.data;
        setStats(payload as StatsMedecin);
      } catch {
        toast.error(STATS_ERREURS.CHARGEMENT_ECHOUE);
      } finally {
        setLoading(false);
      }
    };

    charger();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Statistiques">
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout title="Statistiques">
        <p className="text-center text-muted-foreground py-12">
          Impossible de charger les statistiques
        </p>
      </DashboardLayout>
    );
  }

  const statusData = [
    { name: "En attente", value: stats.rdvEnAttente, fill: "hsl(33, 100%, 58%)" },
    { name: "Confirmés", value: stats.rdvConfirmes, fill: "hsl(var(--status-confirmed))" },
    { name: "Terminés", value: stats.rdvTermines, fill: "hsl(200, 10%, 55%)" },
    { name: "Annulés", value: stats.rdvAnnules, fill: "hsl(1, 84%, 63%)" },
  ];

  const pieData = statusData.filter((d) => d.value > 0);

  return (
    <DashboardLayout title="Statistiques">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatsCard icon={CalendarDays} value={stats.totalRdv} label="Total RDV" color="green" />
          <StatsCard icon={Users} value={stats.totalPatients} label="Patients" color="blue" />
          <StatsCard icon={Clock} value={stats.rdvEnAttente} label="En attente" color="orange" />
          <StatsCard icon={CheckCircle} value={stats.rdvConfirmes} label="Confirmés" color="blue" />
          <StatsCard icon={XCircle} value={stats.rdvTermines} label="Terminés" color="grey" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="medibook-card">
            <h3 className="font-semibold mb-4">RDV par statut</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {statusData.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="medibook-card">
            <h3 className="font-semibold mb-4">Répartition des RDV</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value">
                    {pieData.map((e, i) => (
                      <Cell key={i} fill={e.fill} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StatsPage;
