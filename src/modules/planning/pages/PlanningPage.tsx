import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { creneauService } from '@/modules/creneau/services/creneauService';
import { secretaireMedecinsService } from '@/modules/utilisateur/services/utilisateurService';
import { exceptionSecretaireService } from '@/modules/exception/services/exceptionService';
import { planningService } from '@/modules/planning/services/planningService';
import type { Creneau } from '@/modules/creneau/types/creneau.types';
import type { ExceptionPlanning } from '@/modules/exception/types/exception.types';
import type { Planning } from '@/modules/planning/types/planning.types';
import GrandAgendaUnifie from '@/modules/agenda/components/GrandAgendaUnifie';

interface Medecin {
  id: number;
  prenom: string;
  nom: string;
  specialiteNom?: string;
}

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

const SecretairePlanningPage = () => {
  const navigate = useNavigate();
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [selectedMedecin, setSelectedMedecin] = useState<number | null>(null);
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionPlanning[]>([]);
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDonnees, setLoadingDonnees] = useState(false);

  // Charger les médecins du cabinet
  useEffect(() => {
    secretaireMedecinsService.list()
      .then(res => {
        const data = extraireListe<Medecin>(res.data);
        setMedecins(data);
        if (data.length > 0) setSelectedMedecin(data[0].id);
      })
      .catch(() => toast.error('Erreur lors du chargement des médecins'))
      .finally(() => setLoading(false));
  }, []);

  // Charger le package de données (créneaux, plannings, exceptions) du médecin sélectionné
  const chargerDonneesMedecin = useCallback(() => {
    if (!selectedMedecin) return;
    setLoadingDonnees(true);

    Promise.allSettled([
      creneauService.listParMedecin(selectedMedecin),
      exceptionSecretaireService.list(selectedMedecin),
      planningService.listParMedecin(selectedMedecin)
    ])
      .then(([crenRes, excRes, planRes]) => {
        if (crenRes.status === 'fulfilled') {
          const raw = crenRes.value.data;
          const data = (raw as any)?.data || raw;
          setCreneaux(Array.isArray(data) ? data : []);
        }

        if (excRes.status === 'fulfilled') {
          setExceptions(extraireListe<ExceptionPlanning>(excRes.value.data));
        }

        if (planRes.status === 'fulfilled') {
          setPlannings(extraireListe<Planning>(planRes.value.data));
        }
      })
      .finally(() => setLoadingDonnees(false));
  }, [selectedMedecin]);

  useEffect(() => {
    chargerDonneesMedecin();
  }, [chargerDonneesMedecin]);

  if (loading) {
    return (
      <DashboardLayout title="Grand Agenda & Plannings">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Grand Agenda & Plannings">
      <GrandAgendaUnifie
        medecins={medecins}
        selectedMedecinId={selectedMedecin}
        onSelectMedecin={(id) => setSelectedMedecin(id)}
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
        creneaux={creneaux.map(c => ({
          id: c.id,
          date: typeof c.date === 'string' ? c.date.substring(0, 10) : Array.isArray(c.date) ? `${c.date[0]}-${String(c.date[1]).padStart(2, '0')}-${String(c.date[2]).padStart(2, '0')}` : String(c.date),
          heureDebut: typeof c.heureDebut === 'string' ? c.heureDebut.substring(0, 5) : Array.isArray(c.heureDebut) ? `${String(c.heureDebut[0]).padStart(2, '0')}:${String(c.heureDebut[1]).padStart(2, '0')}` : String(c.heureDebut),
          heureFin: typeof c.heureFin === 'string' ? c.heureFin.substring(0, 5) : Array.isArray(c.heureFin) ? `${String(c.heureFin[0]).padStart(2, '0')}:${String(c.heureFin[1]).padStart(2, '0')}` : String(c.heureFin),
          disponible: c.disponible
        }))}
        loading={loadingDonnees}
        onRefresh={chargerDonneesMedecin}
        onNewException={() => navigate('/secretaire/exceptions')}
        onNewPlanning={() => navigate('/secretaire/plannings/nouveau')}
        userRole="SECRETAIRE"
      />
    </DashboardLayout>
  );
};

export default SecretairePlanningPage;
