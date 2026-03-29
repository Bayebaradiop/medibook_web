import { useEffect, useMemo, useState } from "react";
import { Building2, CalendarDays, Loader2, UserCheck, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DashboardLayout from "@/layouts/DashboardLayout";
import StatsCard from "@/components/common/StatsCard";
import { cabinetService } from "@/modules/cabinet/services/cabinetService";
import { statsService } from "@/modules/stats/services/statsService";
import type { Cabinet } from "@/modules/cabinet/types/cabinet.types";
import type { StatsSuperAdmin } from "@/modules/stats/types/stats.types";
import { toast } from "sonner";

const hasDataProperty = (value: unknown): value is { data: unknown } =>
  typeof value === "object" && value !== null && "data" in value;

const extraireListe = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (hasDataProperty(value) && Array.isArray(value.data)) return value.data as T[];
  return [];
};

const extraireObjet = <T,>(value: unknown): T | null => {
  if (hasDataProperty(value) && typeof value.data === "object" && value.data !== null) {
    return value.data as T;
  }
  if (typeof value === "object" && value !== null) return value as T;
  return null;
};

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<StatsSuperAdmin | null>(null);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const charger = async () => {
      try {
        const [statsRes, cabinetsRes] = await Promise.all([
          statsService.superAdmin(),
          cabinetService.list(),
        ]);

        setStats(extraireObjet<StatsSuperAdmin>(statsRes.data));
        setCabinets(extraireListe<Cabinet>(cabinetsRes.data));
      } catch {
        toast.error("Impossible de charger le dashboard super admin");
      } finally {
        setLoading(false);
      }
    };

    void charger();
  }, []);

  const statusData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "En attente", value: stats.rdvEnAttente, fill: "hsl(33, 100%, 58%)" },
      { name: "Confirmés", value: stats.rdvConfirmes, fill: "hsl(var(--status-confirmed))" },
      { name: "Terminés", value: stats.rdvTermines, fill: "hsl(200, 10%, 55%)" },
      { name: "Annulés", value: stats.rdvAnnules, fill: "hsl(1, 84%, 63%)" },
    ];
  }, [stats]);

  const cabinetStatusData = useMemo(() => {
    const actifs = cabinets.filter((cabinet) => cabinet.status === "ACTIF").length;
    const inactifs = cabinets.filter((cabinet) => cabinet.status !== "ACTIF").length;

    return [
      { name: "Cabinets actifs", value: actifs, fill: "hsl(var(--primary))" },
      { name: "Cabinets inactifs", value: inactifs, fill: "hsl(200, 10%, 55%)" },
    ];
  }, [cabinets]);

  const derniersCabinets = useMemo(
    () => [...cabinets].sort((a, b) => b.id - a.id).slice(0, 5),
    [cabinets],
  );

  return (
    <DashboardLayout title="Dashboard Super Admin">
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatsCard icon={Building2} value={stats?.totalCabinets ?? 0} label="Total Cabinets" color="green" />
            <StatsCard icon={Users} value={stats?.totalMedecins ?? 0} label="Total Médecins" color="blue" />
            <StatsCard icon={UserCheck} value={stats?.totalPatients ?? 0} label="Total Patients" color="orange" />
            <StatsCard icon={CalendarDays} value={stats?.totalRdv ?? 0} label="Total RDV" color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="medibook-card">
              <h3 className="font-semibold mb-4">RDV par statut</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,88%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="medibook-card">
              <h3 className="font-semibold mb-4">Statut des cabinets</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={cabinetStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    dataKey="value"
                    label={{ fontSize: 12 }}
                  >
                    {cabinetStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="medibook-card">
            <h3 className="font-semibold mb-4">Derniers cabinets</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="medibook-table-header">
                    <th className="px-4 py-3 text-left">Nom</th>
                    <th className="px-4 py-3 text-left">Adresse</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {derniersCabinets.map((cabinet) => (
                    <tr key={cabinet.id} className="medibook-table-row">
                      <td className="px-4 py-3 font-medium">{cabinet.nom}</td>
                      <td className="px-4 py-3 text-muted-foreground">{cabinet.adresse}</td>
                      <td className="px-4 py-3 text-muted-foreground">{cabinet.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`medibook-badge ${
                            cabinet.status === "ACTIF"
                              ? "bg-status-active/15 text-status-active"
                              : "bg-status-inactive/15 text-status-inactive"
                          }`}
                        >
                          {cabinet.status === "ACTIF" ? "Actif" : "Inactif"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {derniersCabinets.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        Aucun cabinet disponible pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
