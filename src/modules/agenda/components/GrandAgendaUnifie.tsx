import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  UserCheck, 
  PlusCircle, 
  List, 
  Stethoscope, 
  RefreshCw,
  Plus
} from 'lucide-react';
import { DAYS_OF_WEEK } from '@/utils/constants';

export interface AgendaMedecin {
  id: number;
  prenom: string;
  nom: string;
  specialiteNom?: string;
}

export interface AgendaPlanningTemplate {
  id: number;
  jourSemaine: string;
  heureDebut: string;
  heureFin: string;
  dureeCreneau: number;
}

export interface AgendaException {
  id: number;
  dateDebut: string;
  dateFin: string;
  type: 'ABSENT' | 'VACANCES' | 'FERME' | string;
  heureDebut?: string;
  heureFin?: string;
  motif?: string;
}

export interface AgendaCreneau {
  id: number;
  date: string;
  heureDebut: string;
  heureFin: string;
  disponible: boolean;
}

export interface AgendaRendezVous {
  id: number;
  date: string;
  heureDebut: string;
  heureFin?: string;
  patientNom?: string;
  patientPrenom?: string;
  statut: string;
  medecinNom?: string;
}

interface GrandAgendaUnifieProps {
  medecins?: AgendaMedecin[];
  selectedMedecinId?: number | null;
  onSelectMedecin?: (medecinId: number) => void;
  plannings?: AgendaPlanningTemplate[];
  exceptions?: AgendaException[];
  creneaux?: AgendaCreneau[];
  rendezVous?: AgendaRendezVous[];
  loading?: boolean;
  onRefresh?: () => void;
  onNewException?: () => void;
  onNewPlanning?: () => void;
  userRole?: 'MEDECIN' | 'SECRETAIRE' | 'ADMIN' | 'SUPER_ADMIN';
}

const HOURS = Array.from({ length: 12 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

export const GrandAgendaUnifie: React.FC<GrandAgendaUnifieProps> = ({
  medecins = [],
  selectedMedecinId,
  onSelectMedecin,
  plannings = [],
  exceptions = [],
  creneaux = [],
  rendezVous = [],
  loading = false,
  onRefresh,
  onNewException,
  onNewPlanning,
  userRole = 'MEDECIN'
}) => {
  // Date de référence pour la semaine sélectionnée (Défaut: Lundi de la semaine actuelle)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuster au lundi
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [activeTab, setActiveTab] = useState<'agenda' | 'templates' | 'exceptions'>('agenda');

  // Naviguer entre les semaines
  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const handleToday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  // Calcul des 7 jours de la semaine courante
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const dayDate = new Date(currentWeekStart);
      dayDate.setDate(dayDate.getDate() + i);
      const isoDate = dayDate.toISOString().slice(0, 10);
      const dayName = DAYS_OF_WEEK[i];
      const isToday = new Date().toISOString().slice(0, 10) === isoDate;
      return {
        dateObj: dayDate,
        isoDate,
        dayName,
        dayNumber: dayDate.getDate(),
        monthName: dayDate.toLocaleDateString('fr-FR', { month: 'short' }),
        isToday
      };
    });
  }, [currentWeekStart]);

  const weekTitle = useMemo(() => {
    const first = weekDays[0];
    const last = weekDays[6];
    return `${first.dayNumber} ${first.monthName} — ${last.dayNumber} ${last.monthName} ${last.dateObj.getFullYear()}`;
  }, [weekDays]);

  // Helpers de normalisation
  const normalizeTime = (timeStr?: string) => timeStr ? timeStr.slice(0, 5) : '';

  return (
    <div className="space-y-4">
      {/* Barre de contrôle supérieure (Header Executive) */}
      <div className="medibook-card bg-card p-4 sm:p-5 rounded-3xl border border-border/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Filtre Médecin (Secrétaire) + Titre */}
        <div className="flex flex-wrap items-center gap-3">
          {medecins.length > 0 && onSelectMedecin && (
            <div className="relative min-w-[220px]">
              <select
                value={selectedMedecinId ?? ''}
                onChange={(e) => onSelectMedecin(Number(e.target.value))}
                className="medibook-input text-sm font-bold w-full pl-9"
              >
                {medecins.map((m) => (
                  <option key={m.id} value={m.id}>
                    Dr. {m.prenom} {m.nom} {m.specialiteNom ? `(${m.specialiteNom})` : ''}
                  </option>
                ))}
              </select>
              <Stethoscope className="h-4 w-4 text-primary absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          )}

          {/* Navigation Temporelle */}
          <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-2xl border border-border/60">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 rounded-xl hover:bg-background text-foreground transition-all shadow-2xs"
              title="Semaine précédente"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-bold rounded-xl hover:bg-background text-foreground transition-all shadow-2xs"
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1.5 rounded-xl hover:bg-background text-foreground transition-all shadow-2xs"
              title="Semaine suivante"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span>{weekTitle}</span>
          </div>
        </div>

        {/* Boutons d'Onglets & Actions Rapides */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Machine d'Onglets */}
          <div className="flex rounded-2xl bg-muted/40 p-1 border border-border/60">
            <button
              onClick={() => setActiveTab('agenda')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'agenda'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CalendarIcon size={14} /> Agenda 7 Jours
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'templates'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock size={14} /> Emploi du Temps
            </button>
            <button
              onClick={() => setActiveTab('exceptions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'exceptions'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List size={14} /> Absences ({exceptions.length})
            </button>
          </div>

          {/* Boutons Actions Rapides */}
          {onNewException && (
            <button
              onClick={onNewException}
              className="px-3.5 py-1.5 rounded-xl bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive hover:text-destructive-foreground transition-all text-xs font-bold flex items-center gap-1.5"
            >
              <Plus size={14} /> Absence
            </button>
          )}

          {onNewPlanning && (userRole === 'SECRETAIRE' || userRole === 'ADMIN') && (
            <button
              onClick={onNewPlanning}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle size={14} /> Planning
            </button>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              title="Rafraîchir"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
      </div>

      {/* VUE 1 : GRAND AGENDA UNIFIÉ (7 JOURS DYNAMIQUES) */}
      {activeTab === 'agenda' && (
        <div className="medibook-card p-0 rounded-3xl border border-border/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[950px] border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-xs uppercase tracking-wider">
                  <th className="px-3 py-3 w-16 text-center text-muted-foreground border-r border-border/60">Heure</th>
                  {weekDays.map((day) => (
                    <th
                      key={day.isoDate}
                      className={`px-3 py-3 text-center border-r border-border/60 last:border-r-0 ${
                        day.isToday ? 'bg-primary/10 text-primary font-extrabold' : 'text-foreground font-bold'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] text-muted-foreground">{day.dayName}</span>
                        <span className={`text-base leading-tight ${day.isToday ? 'text-primary' : ''}`}>
                          {day.dayNumber} {day.monthName}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour} className="border-b border-border/60 hover:bg-muted/10 transition-colors">
                    <td className="px-2 py-3 text-xs font-bold text-center text-muted-foreground border-r border-border/60 bg-muted/20">
                      {hour}
                    </td>
                    {weekDays.map((day) => {
                      // 1. Vérifier si cette journée/heure tombe dans une EXCEPTION (Absence/Vacances/Férié)
                      const matchingException = exceptions.find((ex) => {
                        const inDateRange = day.isoDate >= ex.dateDebut && day.isoDate <= (ex.dateFin || ex.dateDebut);
                        if (!inDateRange) return false;
                        if (!ex.heureDebut || !ex.heureFin) return true; // Journée entière
                        const slotHour = normalizeTime(hour);
                        return slotHour >= normalizeTime(ex.heureDebut) && slotHour < normalizeTime(ex.heureFin);
                      });

                      // 2. Vérifier s'il y a un RDV réservé sur ce jour/heure
                      const matchingRdv = rendezVous.find((r) => {
                        return (r.date === day.isoDate || (Array.isArray(r.date) && `${r.date[0]}-${String(r.date[1]).padStart(2, '0')}-${String(r.date[2]).padStart(2, '0')}` === day.isoDate))
                          && normalizeTime(r.heureDebut) === normalizeTime(hour);
                      });

                      // 3. Vérifier les créneaux libres de la base de données
                      const matchingCreneaux = creneaux.filter((c) => {
                        return (c.date === day.isoDate || (Array.isArray(c.date) && `${c.date[0]}-${String(c.date[1]).padStart(2, '0')}-${String(c.date[2]).padStart(2, '0')}` === day.isoDate))
                          && normalizeTime(c.heureDebut) === normalizeTime(hour);
                      });

                      // 4. Vérifier le planning théorique
                      const matchingPlanning = plannings.find((p) => {
                        return p.jourSemaine === day.dayName 
                          && normalizeTime(p.heureDebut) <= normalizeTime(hour) 
                          && normalizeTime(p.heureFin) > normalizeTime(hour);
                      });

                      return (
                        <td key={day.isoDate} className="px-1.5 py-1.5 border-r border-border/60 last:border-r-0 align-top h-16">
                          {/* Cas A : Indisponibilité / Absence (Priorité 1) */}
                          {matchingException ? (
                            <div className="h-full p-2 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive flex flex-col justify-between text-xs font-semibold shadow-2xs">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-extrabold text-[11px] uppercase tracking-wide">
                                  {matchingException.type === 'ABSENT' ? '🚫 Absent' : matchingException.type === 'VACANCES' ? '🌴 Congé' : '🔒 Fermé'}
                                </span>
                              </div>
                              <p className="text-[10px] truncate opacity-90">{matchingException.motif || 'Indisponible'}</p>
                            </div>
                          ) : matchingRdv ? (
                            /* Cas B : Rendez-vous confirmé/réservé (Priorité 2) */
                            <div className="h-full p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-950 dark:text-sky-200 flex flex-col justify-between text-xs shadow-2xs">
                              <div className="flex items-center justify-between font-extrabold text-[11px]">
                                <span className="flex items-center gap-1">
                                  <UserCheck size={12} className="text-sky-500" />
                                  {matchingRdv.patientNom || matchingRdv.patientPrenom || 'Patient'}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-sky-500/20">{normalizeTime(matchingRdv.heureDebut)}</span>
                              </div>
                              <p className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">{matchingRdv.statut}</p>
                            </div>
                          ) : matchingCreneaux.length > 0 ? (
                            /* Cas C : Créneaux générés libres dans la BD (Priorité 3) */
                            <div className="space-y-1">
                              {matchingCreneaux.map((cr) => (
                                <div
                                  key={cr.id}
                                  className={`p-1.5 rounded-lg border text-[11px] font-bold text-center transition-all ${
                                    cr.disponible
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                                      : 'bg-muted border-border text-muted-foreground line-through'
                                  }`}
                                >
                                  {normalizeTime(cr.heureDebut)} - {normalizeTime(cr.heureFin)}
                                </div>
                              ))}
                            </div>
                          ) : matchingPlanning && normalizeTime(matchingPlanning.heureDebut) === normalizeTime(hour) ? (
                            /* Cas D : En-tête de tranche de travail récurrente */
                            <div className="p-2 rounded-xl bg-primary/10 border-l-3 border-primary text-primary text-xs font-semibold">
                              <p className="font-extrabold">{normalizeTime(matchingPlanning.heureDebut)} - {normalizeTime(matchingPlanning.heureFin)}</p>
                              <p className="text-[10px] text-muted-foreground">Ouvert ({matchingPlanning.dureeCreneau}m)</p>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VUE 2 : EMPLOI DU TEMPS RÉCURRENT (TEMPLATES DE SEMAINE) */}
      {activeTab === 'templates' && (
        <div className="medibook-card bg-card p-6 rounded-3xl border border-border/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground text-base">Emploi du Temps Hebdomadaire Recurrent</h3>
              <p className="text-xs text-muted-foreground">Plages d&apos;ouverture définies pour les consultations</p>
            </div>
          </div>

          {plannings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
              Aucun modèle de planning défini pour ce médecin
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DAYS_OF_WEEK.map((day) => {
                const dayPlannings = plannings.filter((p) => p.jourSemaine === day);
                if (dayPlannings.length === 0) return null;

                return (
                  <div key={day} className="p-4 rounded-2xl bg-card border border-border space-y-2">
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" /> {day}
                    </h4>
                    <div className="space-y-2 pt-1">
                      {dayPlannings.map((p) => (
                        <div key={p.id} className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-foreground">{normalizeTime(p.heureDebut)} — {normalizeTime(p.heureFin)}</p>
                            <p className="text-[10px] text-muted-foreground">Créneaux de {p.dureeCreneau} min</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VUE 3 : LISTE DES INDISPONIBILITÉS / EXCEPTIONS */}
      {activeTab === 'exceptions' && (
        <div className="medibook-card bg-card p-6 rounded-3xl border border-border/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground text-base">Registre des Absences et Congés</h3>
              <p className="text-xs text-muted-foreground">Historique des blocages exceptionnels</p>
            </div>
          </div>

          {exceptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
              Aucune exception ou absence enregistrée
            </div>
          ) : (
            <div className="space-y-3">
              {exceptions.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between p-4 rounded-2xl bg-destructive/5 border border-destructive/15">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center font-bold text-lg">
                      🚫
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">
                          {ex.dateDebut === ex.dateFin ? ex.dateDebut : `${ex.dateDebut} → ${ex.dateFin}`}
                        </p>
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-destructive text-destructive-foreground font-extrabold">
                          {ex.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ex.heureDebut && ex.heureFin ? `Horaire: ${normalizeTime(ex.heureDebut)} - ${normalizeTime(ex.heureFin)}` : 'Journée entière'}
                        {ex.motif ? ` · Motif: ${ex.motif}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GrandAgendaUnifie;
