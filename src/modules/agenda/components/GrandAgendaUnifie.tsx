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
  Plus,
  User,
  AlertTriangle
} from 'lucide-react';
import { DAYS_OF_WEEK } from '@/utils/constants';
import { formatDateFR } from '@/utils/date';

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

const START_HOUR = 7; // 07:00
const END_HOUR = 20;  // 20:00
const HOUR_HEIGHT = 64; // pixels par heure

const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => {
  const h = i + START_HOUR;
  return `${h.toString().padStart(2, '0')}:00`;
});

// Helper pour convertir "09:30" ou "09:30:00" en minutes depuis minuit
const parseTimeToMinutes = (timeStr?: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
};

// Formater "09:30:00" -> "09:30"
const formatTime = (timeStr?: string): string => {
  if (!timeStr) return '';
  return timeStr.slice(0, 5);
};

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
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [activeTab, setActiveTab] = useState<'agenda' | 'templates' | 'exceptions'>('agenda');

  const activeExceptions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return exceptions.filter((ex) => {
      const dateEnd = new Date(ex.dateFin || ex.dateDebut);
      dateEnd.setHours(23, 59, 59, 999);
      return dateEnd.getTime() >= today.getTime();
    });
  }, [exceptions]);

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

  // Calculer position verticale `top` (px) et hauteur `height` (px) selon heure de début et de fin
  const getVerticalStyle = (startStr: string, endStr?: string, defaultDurationMin: number = 30) => {
    const gridStartMins = START_HOUR * 60;
    const startMins = parseTimeToMinutes(startStr);
    
    let durationMins = defaultDurationMin;
    if (endStr) {
      const endMins = parseTimeToMinutes(endStr);
      if (endMins > startMins) {
        durationMins = endMins - startMins;
      }
    }

    const startFromGrid = Math.max(0, startMins - gridStartMins);
    const topPx = (startFromGrid / 60) * HOUR_HEIGHT;
    const heightPx = Math.max(26, (durationMins / 60) * HOUR_HEIGHT);

    return {
      top: `${topPx}px`,
      height: `${heightPx}px`
    };
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="medibook-card bg-card p-4 sm:p-5 rounded-3xl border border-border/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Filtre Médecin + Temporel */}
        <div className="flex flex-wrap items-center gap-3">
          {medecins.length > 0 && onSelectMedecin && (
            <div className="relative min-w-[220px]">
              <select
                value={selectedMedecinId ?? ''}
                onChange={(e) => onSelectMedecin(Number(e.target.value))}
                className="medibook-input text-sm font-extrabold w-full pl-9 pr-8 bg-card text-foreground border-border hover:bg-muted focus:ring-2 focus:ring-primary transition-all rounded-2xl shadow-xs cursor-pointer"
              >
                {medecins.map((m) => (
                  <option key={m.id} value={m.id} className="bg-card text-foreground font-semibold py-1">
                    Dr. {m.prenom} {m.nom} {m.specialiteNom ? `(${m.specialiteNom})` : ''}
                  </option>
                ))}
              </select>
              <Stethoscope className="h-4 w-4 text-primary absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          )}

          {/* Nav Temporelle */}
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

        {/* Machine d'Onglets & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-2xl bg-muted/40 p-1 border border-border/60">
            <button
              onClick={() => setActiveTab('agenda')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'agenda'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CalendarIcon size={14} /> Agenda Vertical 7J
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'templates'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock size={14} /> Horaires Recurrents
            </button>
            <button
              onClick={() => setActiveTab('exceptions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'exceptions'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List size={14} /> Absences ({activeExceptions.length})
            </button>
          </div>

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

      {/* VUE 1 : AGENDA TEMPOREL VERTICAL 7 JOURS */}
      {activeTab === 'agenda' && (
        <div className="medibook-card p-0 rounded-3xl border border-border/80 overflow-hidden shadow-sm bg-card">
          {/* Légende rapide en haut */}
          <div className="px-5 py-2.5 bg-muted/30 border-b border-border flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span className="text-muted-foreground">Légende :</span>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-sky-500 border border-sky-600" />
              <span>RDV Confirmé (Étiré verticalement)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-emerald-500/20 border border-emerald-500" />
              <span>Créneau Libre</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-destructive/20 border border-destructive" />
              <span>Absence / Congé</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-primary/10 border border-primary/40" />
              <span>Plage de Consultation</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1000px] relative select-none">
              
              {/* En-tête des 7 jours */}
              <div className="grid grid-cols-[70px_repeat(7,1fr)] bg-muted/40 border-b border-border sticky top-0 z-20">
                <div className="px-2 py-3 text-center text-xs font-bold text-muted-foreground border-r border-border/60">
                  Heure
                </div>
                {weekDays.map((day) => (
                  <div
                    key={day.isoDate}
                    className={`px-3 py-3 text-center border-r border-border/60 last:border-r-0 ${
                      day.isToday ? 'bg-primary/10 text-primary font-extrabold' : 'text-foreground font-bold'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{day.dayName}</span>
                      <span className={`text-base leading-tight ${day.isToday ? 'text-primary' : ''}`}>
                        {day.dayNumber} {day.monthName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Grille Temporelle & Colonnes de jours */}
              <div
                className="grid grid-cols-[70px_repeat(7,1fr)] relative"
                style={{ height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT}px` }}
              >
                {/* Colonne des Heures (Axe Y vertical) */}
                <div className="border-r border-border/60 bg-muted/15 relative">
                  {HOURS.map((h, i) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 text-center text-xs font-bold text-muted-foreground"
                      style={{ top: `${i * HOUR_HEIGHT}px` }}
                    >
                      <span className="relative -top-2 bg-card px-1 rounded">{h}</span>
                    </div>
                  ))}
                </div>

                {/* 7 Colonnes des Jours (Axe X horizontal) */}
                {weekDays.map((day) => {
                  // Filtrer les événements pour ce jour précis
                  const dayRdvs = rendezVous.filter((r) => {
                    const rDate = typeof r.date === 'string' ? r.date.substring(0, 10) : Array.isArray(r.date) ? `${r.date[0]}-${String(r.date[1]).padStart(2, '0')}-${String(r.date[2]).padStart(2, '0')}` : String(r.date);
                    return rDate === day.isoDate;
                  });

                  const dayCreneaux = creneaux.filter((c) => {
                    const cDate = typeof c.date === 'string' ? c.date.substring(0, 10) : Array.isArray(c.date) ? `${c.date[0]}-${String(c.date[1]).padStart(2, '0')}-${String(c.date[2]).padStart(2, '0')}` : String(c.date);
                    return cDate === day.isoDate;
                  });

                  const dayExceptions = exceptions.filter((ex) => {
                    return day.isoDate >= ex.dateDebut && day.isoDate <= (ex.dateFin || ex.dateDebut);
                  });

                  const dayPlannings = plannings.filter((p) => p.jourSemaine === day.dayName);

                  return (
                    <div
                      key={day.isoDate}
                      className="relative border-r border-border/60 last:border-r-0 h-full"
                    >
                      {/* Lignes d'heures d'arrière-plan */}
                      {HOURS.map((_, i) => (
                        <div
                          key={i}
                          className="absolute left-0 right-0 border-b border-border/40 pointer-events-none"
                          style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                        />
                      ))}

                      {/* 1. BLOCS DE PLANNINGS THÉORIQUES (Fond teinté léger) */}
                      {dayPlannings.map((p) => {
                        const style = getVerticalStyle(p.heureDebut, p.heureFin, 60);
                        return (
                          <div
                            key={`plan-${p.id}`}
                            className="absolute left-1 right-1 rounded-xl bg-primary/10 border-l-4 border-primary p-2 opacity-65 pointer-events-none transition-all z-0"
                            style={style}
                          >
                            <span className="text-[10px] font-extrabold text-primary block truncate">
                              Plage Consultation: {formatTime(p.heureDebut)} - {formatTime(p.heureFin)}
                            </span>
                          </div>
                        );
                      })}

                      {/* 2. BLOCS D'EXCEPTIONS / ABSENCES (Blocs Rouges Verticaux) */}
                      {dayExceptions.map((ex) => {
                        const isFullDay = !ex.heureDebut || !ex.heureFin;
                        const style = isFullDay
                          ? { top: '0px', height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT}px` }
                          : getVerticalStyle(ex.heureDebut!, ex.heureFin, 60);

                        return (
                          <div
                            key={`exc-${ex.id}`}
                            className="absolute left-1.5 right-1.5 rounded-2xl bg-destructive/20 border-2 border-destructive/60 p-2.5 text-destructive flex flex-col justify-between shadow-md z-10 backdrop-blur-xs"
                            style={style}
                          >
                            <div>
                              <div className="flex items-center gap-1 font-extrabold text-xs">
                                <AlertTriangle size={14} className="shrink-0" />
                                <span className="uppercase tracking-wide truncate">
                                  {ex.type === 'ABSENT' ? '🚫 Absence' : ex.type === 'VACANCES' ? '🌴 Vacances' : '🔒 Indisponible'}
                                </span>
                              </div>
                              {ex.dateDebut !== ex.dateFin && (
                                <p className="text-[10px] font-black bg-destructive/30 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                                  Du {ex.dateDebut} au {ex.dateFin}
                                </p>
                              )}
                              <p className="text-[11px] font-bold mt-1 leading-tight">
                                {isFullDay ? 'Journée Entière' : `${formatTime(ex.heureDebut)} — ${formatTime(ex.heureFin)}`}
                              </p>
                              {ex.motif && (
                                <p className="text-[10px] opacity-90 truncate mt-0.5 font-medium">« {ex.motif} »</p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* 3. BLOCS DE CRÉNEAUX LIBRES (Créneaux éligibles verts) */}
                      {dayCreneaux.map((cr) => {
                        const style = getVerticalStyle(cr.heureDebut, cr.heureFin, 30);
                        return (
                          <div
                            key={`cren-${cr.id}`}
                            className={`absolute left-2 right-2 rounded-xl p-1.5 border text-xs font-bold flex items-center justify-between transition-all z-10 shadow-2xs ${
                              cr.disponible
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25'
                                : 'bg-muted/80 border-border text-muted-foreground line-through opacity-60'
                            }`}
                            style={style}
                          >
                            <span className="truncate text-[11px]">
                              {formatTime(cr.heureDebut)} - {formatTime(cr.heureFin)}
                            </span>
                            {cr.disponible && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500 text-white font-extrabold">
                                Libre
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {/* 4. BLOCS DE RENDEZ-VOUS CONFIRMÉS (Blocs Bleus Verticaux Étirés) */}
                      {dayRdvs.map((rv) => {
                        const style = getVerticalStyle(rv.heureDebut, rv.heureFin, 45);
                        return (
                          <div
                            key={`rdv-${rv.id}`}
                            className="absolute left-2 right-2 rounded-2xl bg-gradient-to-b from-sky-600 to-sky-700 text-white p-2.5 shadow-lg border border-sky-400 flex flex-col justify-between transition-all hover:scale-[1.02] z-20"
                            style={style}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 text-xs font-extrabold mb-0.5">
                                <span className="flex items-center gap-1 truncate">
                                  <User size={13} className="text-sky-200 shrink-0" />
                                  <span className="truncate">
                                    {[rv.patientPrenom, rv.patientNom].filter(Boolean).join(' ') || 'Patient'}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-100">
                                <Clock size={11} className="shrink-0" />
                                <span>{formatTime(rv.heureDebut)} {rv.heureFin ? `→ ${formatTime(rv.heureFin)}` : ''}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-extrabold pt-1 border-t border-sky-400/40 mt-1">
                              <span className="px-1.5 py-0.5 rounded-md bg-white/20 backdrop-blur-xs uppercase">
                                {rv.statut || 'Confirmé'}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* VUE 2 : EMPLOI DU TEMPS RÉCURRENT */}
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
                            <p className="text-xs font-bold text-foreground">{formatTime(p.heureDebut)} — {formatTime(p.heureFin)}</p>
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

          {activeExceptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
              Aucune exception ou absence à venir enregistrée
            </div>
          ) : (
            <div className="space-y-3">
              {activeExceptions.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between p-4 rounded-2xl bg-destructive/5 border border-destructive/15">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center font-bold text-lg">
                      🚫
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">
                          {ex.dateDebut === ex.dateFin ? formatDateFR(ex.dateDebut) : `${formatDateFR(ex.dateDebut)} → ${formatDateFR(ex.dateFin)}`}
                        </p>
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-destructive text-destructive-foreground font-extrabold">
                          {ex.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ex.heureDebut && ex.heureFin ? `Horaire: ${formatTime(ex.heureDebut)} - ${formatTime(ex.heureFin)}` : 'Journée entière'}
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
