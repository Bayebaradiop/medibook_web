import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import StatusBadge from "@/components/common/StatusBadge";
import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Activity,
  Calendar as CalendarIcon,
  Stethoscope,
  ArrowRight,
  Filter,
  FileSpreadsheet
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { rdvMedecinService } from "@/modules/rdv/services/rdvService";
import { statsService } from "@/modules/stats/services/statsService";
import type { RendezVous } from "@/modules/rdv/types/rdv.types";
import type { StatsMedecin } from "@/modules/stats/types/stats.types";
import { STATS_ERREURS } from "@/modules/stats/messages/stats.erreurs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
const MONTH_NAMES = [
  { value: "ALL", label: "Tous les mois" },
  { value: "01", label: "Janvier" },
  { value: "02", label: "Février" },
  { value: "03", label: "Mars" },
  { value: "04", label: "Avril" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Juin" },
  { value: "07", label: "Juillet" },
  { value: "08", label: "Août" },
  { value: "09", label: "Septembre" },
  { value: "10", label: "Octobre" },
  { value: "11", label: "Novembre" },
  { value: "12", label: "Décembre" },
];

const MedecinDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<StatsMedecin | null>(null);
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);

  // Temporal & Analytical Filter States
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [quickPreset, setQuickPreset] = useState<"7d" | "month" | "year" | "all">("month");
  const [statusFilter, setStatusFilter] = useState<string>("TOUS");

  const fetchDashboardData = async () => {
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    toast.success("Données de la consultation actualisées");
  };

  const todayIso = useMemo(() => toIsoDate(new Date()), []);

  const todayRdvs = useMemo(
    () =>
      rdvs
        .filter((r) => r.date === todayIso)
        .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut)),
    [rdvs, todayIso]
  );

  // Filtered RDVs according to temporal bar
  const filteredRdvs = useMemo(() => {
    return rdvs.filter((r) => {
      if (!r.date) return true;
      const [y, m] = r.date.split("-");
      const matchYear = selectedYear === "ALL" || y === selectedYear;
      const matchMonth = selectedMonth === "ALL" || m === selectedMonth;
      const matchStatus = statusFilter === "TOUS" || r.statut === statusFilter;
      return matchYear && matchMonth && matchStatus;
    });
  }, [rdvs, selectedYear, selectedMonth, statusFilter]);

  // Dynamically computed stats
  const calculatedStats = useMemo(() => {
    const total = filteredRdvs.length;
    const enAttente = filteredRdvs.filter((r) => r.statut === "EN_ATTENTE").length;
    const confirmes = filteredRdvs.filter((r) => r.statut === "CONFIRME").length;
    const termines = filteredRdvs.filter((r) => r.statut === "TERMINE").length;
    const annules = filteredRdvs.filter((r) => r.statut === "ANNULE").length;
    const tauxConfirmation = total > 0 ? Math.round(((confirmes + termines) / total) * 100) : 100;
    return { total, enAttente, confirmes, termines, annules, tauxConfirmation };
  }, [filteredRdvs]);

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

  const statusPieData = useMemo(() => {
    return [
      { name: "En attente", value: calculatedStats.enAttente, color: "#F59E0B" },
      { name: "Confirmés", value: calculatedStats.confirmes, color: "#10B981" },
      { name: "Terminés", value: calculatedStats.termines, color: "#0EA5E9" },
      { name: "Annulés", value: calculatedStats.annules, color: "#EF4444" },
    ].filter((d) => d.value > 0);
  }, [calculatedStats]);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard Praticien">
        <div className="flex items-center justify-center py-24">
          <div className="text-center space-y-3">
            <Loader2 className="animate-spin text-primary mx-auto" size={40} />
            <p className="text-sm font-medium text-muted-foreground">Chargement de votre espace médical...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard Praticien">
      <div className="space-y-6">
        {/* Banner d'Accueil Executive Praticien - Dynamique selon les couleurs du cabinet */}
        <div
          className="relative overflow-hidden rounded-3xl text-white p-6 sm:p-8 shadow-xl border transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary-dark)) 0%, hsl(var(--primary)) 60%, hsl(var(--primary-dark)) 100%)',
            borderColor: 'hsl(var(--primary-light) / 0.35)',
          }}
        >
          {/* Halo lumineux dynamique */}
          <div
            className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'hsl(var(--primary-light) / 0.25)' }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md border border-white/20">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Espace Praticien • Consultations Ouvertes</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Bonjour, Dr. {user?.prenom} {user?.nom} <Sparkles className="h-6 w-6 text-amber-300" />
              </h1>
              <p className="text-sm text-white/90 max-w-xl">
                Vous avez <span className="font-bold text-white underline decoration-amber-300">{todayRdvs.length} rendez-vous</span> programmés aujourd&apos;hui. Suivez vos consultations en temps réel.
              </p>
            </div>

            {/* Raccourcis Rapides Praticien dans la Bannière */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition-all border border-white/20 active:scale-95 shadow-sm disabled:opacity-50"
                title="Actualiser les données"
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin text-amber-300" : ""} />
                <span>Actualiser</span>
              </button>

              <button
                onClick={() => navigate("/medecin/plannings")}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100 text-xs font-extrabold transition-all shadow-md active:scale-95"
              >
                <CalendarIcon size={14} className="text-primary" />
                <span>Grand Agenda</span>
              </button>

              <button
                onClick={() => navigate("/medecin/exceptions")}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition-all shadow-md active:scale-95"
              >
                <Clock size={14} />
                <span>Signaler une Absence</span>
              </button>
            </div>
          </div>
        </div>

        {/* Barre de Filtres Temporels & Statut */}
        <div className="medibook-card bg-card p-4 sm:p-5 rounded-3xl border border-border/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Filter size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Filtres Temporels des Consultations</h3>
                <p className="text-xs text-muted-foreground">Sélectionnez une période d&apos;analyse</p>
              </div>
            </div>

            {/* Presets rapides */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border/60">
              <button
                onClick={() => { setQuickPreset("7d"); setSelectedMonth("ALL"); }}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                  quickPreset === "7d" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                7 Derniers Jours
              </button>
              <button
                onClick={() => { setQuickPreset("month"); setSelectedMonth("08"); }}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                  quickPreset === "month" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Ce Mois
              </button>
              <button
                onClick={() => { setQuickPreset("year"); setSelectedMonth("ALL"); }}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                  quickPreset === "year" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Année 2026
              </button>
              <button
                onClick={() => { setQuickPreset("all"); setSelectedYear("ALL"); setSelectedMonth("ALL"); setStatusFilter("TOUS"); }}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                  quickPreset === "all" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tout voir
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/50">
            {/* Sélecteur d'année */}
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Année</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="medibook-input text-xs w-full py-2"
              >
                <option value="ALL">Toutes les années</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>

            {/* Sélecteur de mois */}
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Mois</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="medibook-input text-xs w-full py-2"
              >
                {MONTH_NAMES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Sélecteur de statut */}
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Statut du RDV</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="medibook-input text-xs w-full py-2"
              >
                <option value="TOUS">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="CONFIRME">Confirmé</option>
                <option value="TERMINE">Terminé</option>
                <option value="ANNULE">Annulé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="medibook-card bg-card p-5 rounded-3xl border border-border/80 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Total RDV</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                <CalendarDays size={18} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-foreground tracking-tight">{calculatedStats.total}</p>
              <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1 mt-1">
                <TrendingUp size={12} /> Période active
              </span>
            </div>
          </div>

          <div className="medibook-card bg-card p-5 rounded-3xl border border-amber-500/20 bg-amber-500/5 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">En Attente</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-foreground tracking-tight">{calculatedStats.enAttente}</p>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">À valider rapidement</span>
            </div>
          </div>

          <div className="medibook-card bg-card p-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Confirmés</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
                <CheckCircle size={18} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-foreground tracking-tight">{calculatedStats.confirmes}</p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Patient programmé</span>
            </div>
          </div>

          <div className="medibook-card bg-card p-5 rounded-3xl border border-sky-500/20 bg-sky-500/5 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">Terminés</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-500">
                <Stethoscope size={18} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-foreground tracking-tight">{calculatedStats.termines}</p>
              <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">Consultations effectuées</span>
            </div>
          </div>

          <div className="medibook-card bg-card p-5 rounded-3xl border border-rose-500/20 bg-rose-500/5 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Annulés</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500">
                <XCircle size={18} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-foreground tracking-tight">{calculatedStats.annules}</p>
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">Créneaux libérés</span>
            </div>
          </div>
        </div>

        {/* Graphical Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Evolution area chart */}
          <div className="lg:col-span-7 medibook-card bg-card p-6 rounded-3xl border border-border/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Activité des Consultations (7 derniers jours)
                </h3>
                <p className="text-xs text-muted-foreground">Nombre de rendez-vous enregistrés jour par jour</p>
              </div>
            </div>

            <div className="h-[240px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekData}>
                  <defs>
                    <linearGradient id="medecinGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="jour" tick={{ fontSize: 12, fill: "#94A3B8" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderRadius: "14px", border: "1px solid #1E293B", color: "#fff", fontSize: "12px" }} />
                  <Area
                    type="monotone"
                    dataKey="rdv"
                    stroke="hsl(var(--primary))"
                    fill="url(#medecinGradient)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Status Donut Chart */}
          <div className="lg:col-span-5 medibook-card bg-card p-6 rounded-3xl border border-border/80 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-foreground text-base flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Répartition des Statuts de RDV
              </h3>
              <p className="text-xs text-muted-foreground">Proportion des rendez-vous selon la sélection</p>

              {statusPieData.length > 0 ? (
                <div className="h-[180px] w-full my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", border: "1px solid #1E293B", color: "#fff", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-xs text-muted-foreground">
                  Aucune donnée disponible pour cette période
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border grid grid-cols-2 gap-2 text-center">
              <div className="bg-muted/50 p-2.5 rounded-xl">
                <span className="text-[11px] text-muted-foreground font-medium">Taux d&apos;Honorés</span>
                <p className="text-base font-bold text-primary">{calculatedStats.tauxConfirmation}%</p>
              </div>
              <div className="bg-muted/50 p-2.5 rounded-xl">
                <span className="text-[11px] text-muted-foreground font-medium">Total Sélectionné</span>
                <p className="text-base font-bold text-foreground">{calculatedStats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Live Agenda & Actions Rapides */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Agenda du jour */}
          <div className="lg:col-span-8 medibook-card bg-card p-6 rounded-3xl border border-border/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Agenda des RDV du Jour ({todayRdvs.length})
                </h3>
                <p className="text-xs text-muted-foreground">Vos consultations programmées aujourd&apos;hui</p>
              </div>
              <button
                onClick={() => navigate("/medecin/rendez-vous")}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Voir tout l&apos;agenda</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="space-y-3">
              {todayRdvs.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border rounded-2xl">
                  <p className="text-sm font-semibold text-foreground">Aucun RDV aujourd&apos;hui</p>
                  <p className="text-xs text-muted-foreground mt-1">Vos créneaux sont libres pour la journée.</p>
                </div>
              ) : (
                todayRdvs.map((rv) => (
                  <div
                    key={rv.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-border/70 bg-card hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {rv.heureDebut?.slice(0, 5)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {[rv.patientPrenom, rv.patientNom].filter(Boolean).join(" ") || "Patient"}
                        </p>
                        <p className="text-xs text-muted-foreground">{rv.motif || "Consultation de routine"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={rv.statut} />
                      <button
                        onClick={() => navigate(`/medecin/rendez-vous/${rv.id}`)}
                        className="px-3 py-1.5 rounded-xl bg-muted hover:bg-primary hover:text-white text-xs font-semibold transition-all"
                      >
                        Consulter
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Raccourcis Rapides Praticien */}
          <div className="lg:col-span-4 medibook-card bg-card p-6 rounded-3xl border border-border/80 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-bold text-foreground text-base mb-1">Action Rapides Praticien</h3>
              <p className="text-xs text-muted-foreground mb-4">Gérez votre planning et vos indisponibilités</p>

              <div className="space-y-3">
                <button
                  onClick={() => navigate("/medecin/plannings")}
                  className="w-full p-3 rounded-2xl border border-border bg-card hover:border-primary/50 text-left flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <CalendarIcon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Mes Plannings</p>
                      <p className="text-[11px] text-muted-foreground">Configurer vos horaires</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                <button
                  onClick={() => navigate("/medecin/exceptions")}
                  className="w-full p-3 rounded-2xl border border-border bg-card hover:border-primary/50 text-left flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Signaler une Absence</p>
                      <p className="text-[11px] text-muted-foreground">Bloquer des créneaux d&apos;exception</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground group-hover:text-amber-500 transition-colors" />
                </button>

                <button
                  onClick={() => navigate("/medecin/statistiques")}
                  className="w-full p-3 rounded-2xl border border-border bg-card hover:border-primary/50 text-left flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileSpreadsheet size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Rapports & Statistiques</p>
                      <p className="text-[11px] text-muted-foreground">Analytique avancée</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground group-hover:text-sky-500 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MedecinDashboard;
