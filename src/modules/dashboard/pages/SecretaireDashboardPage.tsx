import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import {
  Users,
  CalendarDays,
  Clock,
  Calendar,
  Stethoscope,
  UserCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  Filter,
  ArrowRight,
  TrendingUp,
  Building2,
  PlusCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { statsService } from '@/modules/stats/services/statsService';
import { rdvSecretaireService } from '@/modules/rdv/services/rdvService';
import { secretaireMedecinsService } from '@/modules/utilisateur/services/utilisateurService';
import type { StatsSecretaire } from '@/modules/stats/types/stats.types';
import type { RendezVous } from '@/modules/rdv/types/rdv.types';
import type { Medecin } from '@/modules/utilisateur/types/utilisateur.types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const MONTH_NAMES = [
  { value: 'ALL', label: 'Tous les mois' },
  { value: '01', label: 'Janvier' },
  { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' },
  { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' },
  { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre' },
  { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },
  { value: '12', label: 'Décembre' },
];

const SecretaireDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsSecretaire | null>(null);
  const [recentRdvs, setRecentRdvs] = useState<RendezVous[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Temporal & Analytical Filters
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedMedecinId, setSelectedMedecinId] = useState<string>('ALL');
  const [quickPreset, setQuickPreset] = useState<'7d' | 'month' | 'year' | 'all'>('month');

  const fetchDashboardData = async () => {
    try {
      const [statsRes, rdvRes, medecinsRes] = await Promise.all([
        statsService.secretaire(),
        rdvSecretaireService.enAttente(),
        secretaireMedecinsService.list(),
      ]);

      setStats((statsRes.data as any)?.data || statsRes.data);

      const rdvRaw = (rdvRes.data as any)?.data;
      const rdvData = Array.isArray(rdvRaw) ? rdvRaw : Array.isArray(rdvRaw?.content) ? rdvRaw.content : [];
      setRecentRdvs(rdvData);

      const medRaw = (medecinsRes.data as any)?.data;
      const medData = Array.isArray(medRaw) ? medRaw : Array.isArray(medRaw?.content) ? medRaw.content : [];
      setMedecins(medData);
    } catch {
      toast.error('Erreur lors du chargement du tableau de bord secrétariat');
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
    toast.success('Données du secrétariat mises à jour');
  };

  // Filtered RDVs according to temporal and doctor bar
  const filteredRdvs = useMemo(() => {
    return recentRdvs.filter((r) => {
      if (!r.date) return true;
      const [y, m] = r.date.split('-');
      const matchYear = selectedYear === 'ALL' || y === selectedYear;
      const matchMonth = selectedMonth === 'ALL' || m === selectedMonth;
      const matchMedecin = selectedMedecinId === 'ALL' || String(r.medecinId) === selectedMedecinId;
      return matchYear && matchMonth && matchMedecin;
    });
  }, [recentRdvs, selectedYear, selectedMonth, selectedMedecinId]);

  // Chart 1: Charge de travail / RDV par Médecin du cabinet (NON-DUPLIQUÉ)
  const rdvsPerMedecinData = useMemo(() => {
    if (!medecins.length) return [];
    return medecins.map((m) => {
      const name = `Dr. ${m.nom || m.prenom || 'Médecin'}`;
      const count = filteredRdvs.filter((r) => String(r.medecinId) === String(m.id)).length;
      return { name, total: count };
    });
  }, [medecins, filteredRdvs]);

  // Chart 2: Répartition des RDV par Statut (Pie chart)
  const statusData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'En attente', value: stats.rdvEnAttente, fill: '#F59E0B' },
      { name: 'Confirmés', value: stats.rdvConfirmes, fill: '#10B981' },
      { name: 'Terminés', value: stats.rdvTermines, fill: '#0EA5E9' },
      { name: 'Annulés', value: stats.rdvAnnules, fill: '#EF4444' },
    ];
  }, [stats]);

  const pieData = useMemo(() => statusData.filter((d) => d.value > 0), [statusData]);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard Secrétariat">
        <div className="flex items-center justify-center py-24">
          <div className="text-center space-y-3">
            <Loader2 className="animate-spin text-primary mx-auto" size={40} />
            <p className="text-sm font-medium text-muted-foreground">Chargement de votre espace secrétariat...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout title="Dashboard Secrétariat">
        <p className="text-center text-muted-foreground py-12">Impossible de charger le tableau de bord secrétariat</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={stats.cabinetNom ? `Dashboard — ${stats.cabinetNom}` : 'Dashboard Secrétariat'}>
      <div className="space-y-6">
        {/* Banner d'Accueil Executive Secrétariat - Dynamique selon les couleurs du cabinet */}
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
                <Building2 size={13} className="text-teal-300" />
                <span>{stats.cabinetNom || 'Cabinet Médical'} • Service Accueil & Secrétariat</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Bonjour, {user?.prenom} {user?.nom} <Sparkles className="h-6 w-6 text-amber-300" />
              </h1>
              <p className="text-sm text-white/90 max-w-xl">
                Vous gérez l&apos;accueil de <span className="font-bold text-white underline decoration-amber-300">{stats.totalMedecins} médecins</span>. Il y a actuellement <span className="font-bold text-amber-300">{stats.rdvEnAttente} demandes en attente</span>.
              </p>
            </div>

            {/* Raccourcis Rapides Secrétariat dans la Bannière */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition-all border border-white/20 active:scale-95 shadow-sm disabled:opacity-50"
                title="Actualiser"
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin text-amber-300" : ""} />
                <span>Actualiser</span>
              </button>

              <button
                onClick={() => navigate('/secretaire/creneaux')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100 text-xs font-extrabold transition-all shadow-md active:scale-95"
              >
                <Calendar size={14} className="text-primary" />
                <span>Grand Agenda</span>
              </button>

              <button
                onClick={() => navigate('/secretaire/rdv-en-attente')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition-all shadow-md active:scale-95"
              >
                <AlertCircle size={14} />
                <span>Valider RDV ({stats.rdvEnAttente})</span>
              </button>

              <button
                onClick={() => navigate('/secretaire/plannings/nouveau')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 text-xs font-bold transition-all shadow-md active:scale-95 backdrop-blur-md border border-white/20"
              >
                <PlusCircle size={14} />
                <span>Nouveau Planning</span>
              </button>
            </div>
          </div>
        </div>

        {/* Barre de Filtres Temporels & Médecin */}
        <div className="medibook-card bg-card p-4 sm:p-5 rounded-3xl border border-border/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Filter size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Filtres du Secrétariat</h3>
                <p className="text-xs text-muted-foreground">Filtrez l&apos;activité globale ou par praticien</p>
              </div>
            </div>

            {/* Presets rapides */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border/60">
              <button
                onClick={() => { setQuickPreset('7d'); setSelectedMonth('ALL'); }}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                  quickPreset === '7d' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                7 Derniers Jours
              </button>
              <button
                onClick={() => { setQuickPreset('month'); setSelectedMonth('08'); }}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                  quickPreset === 'month' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Ce Mois
              </button>
              <button
                onClick={() => { setQuickPreset('year'); setSelectedMonth('ALL'); }}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                  quickPreset === 'year' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Année 2026
              </button>
              <button
                onClick={() => { setQuickPreset('all'); setSelectedYear('ALL'); setSelectedMonth('ALL'); setSelectedMedecinId('ALL'); }}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                  quickPreset === 'all' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Tout voir
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/50">
            {/* Sélecteur Médecin */}
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Médecin du Cabinet</label>
              <select
                value={selectedMedecinId}
                onChange={(e) => setSelectedMedecinId(e.target.value)}
                className="medibook-input text-xs w-full py-2"
              >
                <option value="ALL">Tous les médecins ({stats.totalMedecins})</option>
                {medecins.map((m) => (
                  <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>
                ))}
              </select>
            </div>

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
          </div>
        </div>

        {/* Dynamic Executive Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="medibook-card bg-card p-5 rounded-3xl border border-border/80 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Médecins du Cabinet</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <Stethoscope size={18} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-foreground tracking-tight">{stats.totalMedecins}</p>
              <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1 mt-1">
                <UserCheck size={12} /> Praticiens enregistrés
              </span>
            </div>
          </div>

          <div className="medibook-card bg-card p-5 rounded-3xl border border-border/80 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Patients Suivis</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-foreground tracking-tight">{stats.totalPatients}</p>
              <span className="text-[11px] text-sky-500 font-medium flex items-center gap-1 mt-1">
                <TrendingUp size={12} /> Base active cabinet
              </span>
            </div>
          </div>

          <div className="medibook-card bg-card p-5 rounded-3xl border border-border/80 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Total Rendez-vous</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                <CalendarDays size={18} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-foreground tracking-tight">{stats.totalRdv}</p>
              <span className="text-[11px] text-teal-500 font-medium flex items-center gap-1 mt-1">
                <Calendar size={12} /> Volume des créneaux
              </span>
            </div>
          </div>

          <div className="medibook-card bg-card p-5 rounded-3xl border border-amber-500/30 bg-amber-500/5 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">RDV en Attente</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-foreground tracking-tight">{stats.rdvEnAttente}</p>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Validation prioritaire</span>
            </div>
          </div>
        </div>

        {/* Status Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="medibook-card p-4 rounded-2xl flex items-center gap-3.5 border border-amber-500/20 bg-amber-500/5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">⏳</div>
            <div>
              <p className="text-xl font-black text-foreground">{stats.rdvEnAttente}</p>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">En attente</p>
            </div>
          </div>

          <div className="medibook-card p-4 rounded-2xl flex items-center gap-3.5 border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"><CheckCircle2 size={20} /></div>
            <div>
              <p className="text-xl font-black text-foreground">{stats.rdvConfirmes}</p>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Confirmés</p>
            </div>
          </div>

          <div className="medibook-card p-4 rounded-2xl flex items-center gap-3.5 border border-sky-500/20 bg-sky-500/5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold"><CalendarDays size={20} /></div>
            <div>
              <p className="text-xl font-black text-foreground">{stats.rdvTermines}</p>
              <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">Terminés</p>
            </div>
          </div>

          <div className="medibook-card p-4 rounded-2xl flex items-center gap-3.5 border border-rose-500/20 bg-rose-500/5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold"><XCircle size={20} /></div>
            <div>
              <p className="text-xl font-black text-foreground">{stats.rdvAnnules}</p>
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">Annulés</p>
            </div>
          </div>
        </div>

        {/* Graphical Analytics Section - Diagrammes Différenciés Sans Doublons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Graphique 1: Charge de travail par Médecin (Bar Chart) */}
          <div className="lg:col-span-7 medibook-card bg-card p-6 rounded-3xl border border-border/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  Charge de Travail par Praticien (RDV)
                </h3>
                <p className="text-xs text-muted-foreground">Nombre de rendez-vous gérés par chaque médecin du cabinet</p>
              </div>
            </div>

            <div className="h-[250px] w-full pt-2">
              {rdvsPerMedecinData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rdvsPerMedecinData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94A3B8" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderRadius: "14px", border: "1px solid #1E293B", color: "#fff", fontSize: "12px" }} />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Aucun médecin répertorié
                </div>
              )}
            </div>
          </div>

          {/* Graphique 2: Répartition par Statut (Pie Chart Donut) */}
          <div className="lg:col-span-5 medibook-card bg-card p-6 rounded-3xl border border-border/80 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-foreground text-base flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-amber-500" />
                Répartition Globale par Statut
              </h3>
              <p className="text-xs text-muted-foreground">Proportion globale des réservations du cabinet</p>

              {pieData.length > 0 ? (
                <div className="h-[200px] w-full my-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderRadius: "12px", border: "1px solid #1E293B", color: "#fff", fontSize: "12px" }} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground text-xs">
                  Aucun rendez-vous disponible
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecretaireDashboard;
