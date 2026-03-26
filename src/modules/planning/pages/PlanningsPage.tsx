import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { DAYS_OF_WEEK } from "@/utils/constants";
import { Calendar, List, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { planningService } from "../services/planningService";
import type { Planning } from "../types/planning.types";
import { PLANNING_ERREURS } from "../messages/planning.erreurs";

const HOURS = Array.from({ length: 12 }, (_, i) => `${(i + 7).toString().padStart(2, "0")}:00`);

const hasDataProperty = (value: unknown): value is { data: unknown } =>
  typeof value === "object" && value !== null && "data" in value;

const extraireListe = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (hasDataProperty(value) && Array.isArray(value.data)) return value.data as T[];
  return [];
};

const normalizeTime = (value: string) => value.slice(0, 5);

const PlanningsPage = () => {
  const [view, setView] = useState<"week" | "list">("week");
  const [loading, setLoading] = useState(true);
  const [plannings, setPlannings] = useState<Planning[]>([]);

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await planningService.listMedecin();
        setPlannings(extraireListe<Planning>(res.data));
      } catch {
        toast.error(PLANNING_ERREURS.CHARGEMENT_ECHOUE);
      } finally {
        setLoading(false);
      }
    };

    charger();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Mes Plannings">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mes Plannings">
      <div className="space-y-4">
        <div className="flex justify-end">
          <div className="flex rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setView("week")}
              className={`p-2 px-3 flex items-center gap-1 text-sm ${
                view === "week" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <Calendar size={16} /> Semaine
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 px-3 flex items-center gap-1 text-sm ${
                view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <List size={16} /> Liste
            </button>
          </div>
        </div>

        {plannings.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Aucun planning enregistré</div>
        ) : view === "week" ? (
          <div className="medibook-card p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="medibook-table-header">
                  <th className="px-2 py-3 w-16"></th>
                  {DAYS_OF_WEEK.map((d) => (
                    <th key={d} className="px-2 py-3 text-center">
                      {d.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour} className="border-b border-border">
                    <td className="px-2 py-3 text-xs text-muted-foreground">{hour}</td>
                    {DAYS_OF_WEEK.map((day) => {
                      const planning = plannings.find(
                        (p) =>
                          p.jourSemaine === day &&
                          normalizeTime(p.heureDebut) <= hour &&
                          normalizeTime(p.heureFin) > hour
                      );

                      return (
                        <td key={day} className="px-1 py-1">
                          {planning && normalizeTime(planning.heureDebut) === hour && (
                            <div className="bg-primary/10 text-primary rounded-lg p-2 text-xs font-medium border-l-2 border-primary">
                              <p>
                                {normalizeTime(planning.heureDebut)}-{normalizeTime(planning.heureFin)}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {planning.dureeCreneau}min
                              </p>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS_OF_WEEK.map((day) => {
              const dayPlannings = plannings.filter((p) => p.jourSemaine === day);
              if (dayPlannings.length === 0) return null;

              return (
                <div key={day} className="medibook-card">
                  <h3 className="font-semibold text-sm mb-3">{day}</h3>
                  <div className="space-y-2">
                    {dayPlannings.map((p) => (
                      <div key={p.id} className="bg-primary/5 rounded-xl p-3 border-l-2 border-primary">
                        <p className="text-sm font-medium">
                          {normalizeTime(p.heureDebut)} - {normalizeTime(p.heureFin)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Créneaux de {p.dureeCreneau} min
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PlanningsPage;
