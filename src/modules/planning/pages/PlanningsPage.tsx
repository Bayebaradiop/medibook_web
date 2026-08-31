import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { DashboardSkeleton } from "@/components/common/SkeletonLoaders";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { planningService } from "../services/planningService";
import { exceptionMedecinService } from "@/modules/exception/services/exceptionService";
import type { Planning } from "../types/planning.types";
import type { ExceptionPlanning } from "@/modules/exception/types/exception.types";
import { PLANNING_ERREURS } from "../messages/planning.erreurs";
import GrandAgendaUnifie from "@/modules/agenda/components/GrandAgendaUnifie";

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

const PlanningsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionPlanning[]>([]);

  const chargerDonnees = useCallback(async () => {
    try {
      const [planRes, excRes] = await Promise.allSettled([
        planningService.listMedecin(),
        exceptionMedecinService.list()
      ]);
      
      if (planRes.status === "fulfilled") {
        setPlannings(extraireListe<Planning>(planRes.value.data));
      } else {
        toast.error(PLANNING_ERREURS.CHARGEMENT_ECHOUE);
      }

      if (excRes.status === "fulfilled") {
        setExceptions(extraireListe<ExceptionPlanning>(excRes.value.data));
      }
    } catch {
      toast.error(PLANNING_ERREURS.CHARGEMENT_ECHOUE);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    chargerDonnees();
  }, [chargerDonnees]);

  const handleRefresh = () => {
    setRefreshing(true);
    chargerDonnees();
  };

  if (loading) {
    return (
      <DashboardLayout title="Grand Agenda Médical">
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Grand Agenda Médical">
      <GrandAgendaUnifie
        plannings={plannings.map(p => ({
          id: p.id,
          jourSemaine: p.jourSemaine,
          heureDebut: p.heureDebut,
          heureFin: p.heureFin,
          dureeCreneau: p.dureeCreneau
        }))}
        exceptions={exceptions.map(e => ({
          id: e.id,
          dateDebut: e.dateDebut,
          dateFin: e.dateFin,
          type: e.type,
          heureDebut: e.heureDebut,
          heureFin: e.heureFin,
          motif: e.motif
        }))}
        loading={refreshing}
        onRefresh={handleRefresh}
        onNewException={() => navigate('/medecin/exceptions')}
        userRole="MEDECIN"
      />
    </DashboardLayout>
  );
};

export default PlanningsPage;
