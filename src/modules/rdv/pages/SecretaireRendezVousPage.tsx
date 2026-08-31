import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { TableSkeleton } from '@/components/common/SkeletonLoaders';
import { rdvSecretaireService } from '@/modules/rdv/services/rdvService';
import { secretaireMedecinsService } from '@/modules/utilisateur/services/utilisateurService';
import type { RendezVous, RdvStatut } from '@/modules/rdv/types/rdv.types';
import type { Medecin } from '@/modules/utilisateur/types/utilisateur.types';
import { RDV_ERREURS } from '@/modules/rdv/messages/rdv.erreurs';
import { RDV_SUCCES } from '@/modules/rdv/messages/rdv.succes';
import { peutAnnuler } from '@/modules/rdv/logique/rdv.regles';
import { 
  XCircle, 
  Loader2, 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  Filter, 
  RefreshCw,
  CheckCircle2,
  ListFilter,
  User,
  Stethoscope,
  Phone,
  LayoutGrid,
  List,
  Eye,
  X,
  FileText,
  CalendarDays,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

type DateQuickFilter = 'ALL' | 'TODAY' | 'TOMORROW' | 'THIS_WEEK';

const SecretaireRendezVousPage = () => {
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Onglet de Priorité Visuelle (Par défaut: CONFIRME)
  const [activeTab, setActiveTab] = useState<RdvStatut | 'ALL'>('CONFIRME');

  // Filtres complémentaires
  const [filterMedecin, setFilterMedecin] = useState<string>('');
  const [dateQuickFilter, setDateQuickFilter] = useState<DateQuickFilter>('ALL');
  const [customDate, setCustomDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Vue & Modales
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);
  const [rdvToCancel, setRdvToCancel] = useState<RendezVous | null>(null);

  const fetchRdvs = useCallback(() => {
    setLoading(true);
    rdvSecretaireService.list()
      .then(res => {
        const raw = (res.data as any)?.data;
        const data = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : [];
        setRdvs(data);
      })
      .catch(() => toast.error(RDV_ERREURS.CHARGEMENT_ECHOUE))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRdvs();
    secretaireMedecinsService.list()
      .then(res => {
        const raw = (res.data as any)?.data;
        const data = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : [];
        setMedecins(data);
      })
      .catch(() => {});
  }, [fetchRdvs]);

  const handleAnnuler = async (id: number) => {
    setActionLoading(id);
    try {
      await rdvSecretaireService.annuler(id);
      toast.success(RDV_SUCCES.ANNULE);
      setRdvToCancel(null);
      if (selectedRdv?.id === id) {
        setSelectedRdv(prev => prev ? { ...prev, statut: 'ANNULE' } : null);
      }
      fetchRdvs();
    } catch { 
      toast.error(RDV_ERREURS.ANNULATION_ECHOUEE); 
    } finally { 
      setActionLoading(null); 
    }
  };

  // Dates ISO de référence
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const weekRange = useMemo(() => {
    const now = new Date();
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 7));
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  }, []);

  // Compteurs statistiques par statut
  const stats = useMemo(() => {
    return {
      confirmes: rdvs.filter(r => r.statut === 'CONFIRME').length,
      termines: rdvs.filter(r => r.statut === 'TERMINE').length,
      annules: rdvs.filter(r => r.statut === 'ANNULE').length,
      total: rdvs.length,
    };
  }, [rdvs]);

  // Filtrage combiné et Tri intelligent
  const filteredRdvs = useMemo(() => {
    const list = rdvs.filter(r => {
      // 1. Statut / Onglet
      const matchTab = activeTab === 'ALL' || r.statut === activeTab;

      // 2. Médecin
      const matchMedecin = !filterMedecin || r.medecinId === Number(filterMedecin);
      
      // 3. Date (Quick + Custom)
      let matchDate = true;
      if (customDate) {
        matchDate = r.date === customDate;
      } else if (dateQuickFilter === 'TODAY') {
        matchDate = r.date === todayStr;
      } else if (dateQuickFilter === 'TOMORROW') {
        matchDate = r.date === tomorrowStr;
      } else if (dateQuickFilter === 'THIS_WEEK') {
        matchDate = r.date >= weekRange.start && r.date <= weekRange.end;
      }

      // 4. Recherche textuelle multi-champs
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || [
        r.patientPrenom,
        r.patientNom,
        r.patientTelephone,
        r.medecinPrenom,
        r.medecinNom,
        r.motif
      ].some(field => field?.toLowerCase().includes(q));

      return matchTab && matchMedecin && matchDate && matchSearch;
    });

    // Tri selon l'onglet
    return list.sort((a, b) => {
      if (activeTab === 'CONFIRME') {
        // En priorité les RDV à venir : plus proche au plus éloigné (Date ASC, Heure ASC)
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.heureDebut || "").localeCompare(b.heureDebut || "");
      } else {
        // Pour les terminés / annulés : plus récents en premier (Date DESC, Heure DESC)
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return (b.heureDebut || "").localeCompare(a.heureDebut || "");
      }
    });
  }, [rdvs, activeTab, filterMedecin, dateQuickFilter, customDate, searchQuery, todayStr, tomorrowStr, weekRange]);

  const resetFilters = () => {
    setFilterMedecin('');
    setDateQuickFilter('ALL');
    setCustomDate('');
    setSearchQuery('');
  };

  const hasActiveFilters = Boolean(filterMedecin || dateQuickFilter !== 'ALL' || customDate || searchQuery);

  return (
    <DashboardLayout title="Registre des Rendez-Vous">
      <div className="space-y-6">

        {/* En-tête de page moderne */}
        <div className="medibook-card bg-gradient-to-r from-card via-card to-primary/5 p-6 rounded-3xl border border-border/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-xs">
              <CalendarDays size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Registre Général des Rendez-Vous
              </h1>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Planning global du cabinet — {stats.confirmes} rendez-vous confirmés à honorer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchRdvs}
              disabled={loading}
              className="px-4 py-2.5 rounded-2xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-all flex items-center gap-2 shadow-xs active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-primary" : ""} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ONGLETS DE PRIORITE VISUELLE (CONFIRMES EN PREMIER) */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border/70">
          
          {/* Onglet 1: Confirmés / À venir (PAR DEFAUT) */}
          <button
            onClick={() => setActiveTab('CONFIRME')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'CONFIRME'
                ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 size={16} className={activeTab === 'CONFIRME' ? "text-emerald-500" : ""} />
            <span>📅 À venir & Confirmés</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'CONFIRME' ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
            }`}>
              {stats.confirmes}
            </span>
          </button>

          {/* Onglet 2: Terminés (Historique) */}
          <button
            onClick={() => setActiveTab('TERMINE')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'TERMINE'
                ? "bg-card text-sky-600 dark:text-sky-400 shadow-xs border border-sky-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Check size={16} className={activeTab === 'TERMINE' ? "text-sky-500" : ""} />
            <span>✅ Historique (Terminés)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'TERMINE' ? "bg-sky-500/20 text-sky-600 dark:text-sky-400" : "bg-muted text-muted-foreground"
            }`}>
              {stats.termines}
            </span>
          </button>

          {/* Onglet 3: Annulés (Archives) */}
          <button
            onClick={() => setActiveTab('ANNULE')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ANNULE'
                ? "bg-card text-rose-600 dark:text-rose-400 shadow-xs border border-rose-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <XCircle size={16} className={activeTab === 'ANNULE' ? "text-rose-500" : ""} />
            <span>🚫 Annulés</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'ANNULE' ? "bg-rose-500/20 text-rose-600 dark:text-rose-400" : "bg-muted text-muted-foreground"
            }`}>
              {stats.annules}
            </span>
          </button>

          {/* Onglet 4: Tous */}
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ml-auto ${
              activeTab === 'ALL'
                ? "bg-card text-primary shadow-xs border border-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Tous ({stats.total})</span>
          </button>

        </div>

        {/* Barre de Filtres Complémentaires & Contrôles */}
        <div className="medibook-card bg-card p-5 rounded-3xl border border-border/80 shadow-xs space-y-4">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Recherche globale */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Rechercher par patient, téléphone, médecin, motif..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="medibook-input w-full pl-10 pr-9 text-xs font-medium h-11 rounded-2xl bg-muted/40 border-border/70 focus:bg-card"
              />
              <Search className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Raccourcis de Dates Rapides */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-muted/50 border border-border/60">
              {[
                { key: 'ALL', label: 'Toutes les dates' },
                { key: 'TODAY', label: "Aujourd'hui" },
                { key: 'TOMORROW', label: 'Demain' },
                { key: 'THIS_WEEK', label: 'Cette semaine' },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => {
                    setDateQuickFilter(item.key as DateQuickFilter);
                    setCustomDate('');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dateQuickFilter === item.key && !customDate
                      ? 'bg-card text-primary shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Sélecteur Mode d'Affichage */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-muted/50 border border-border/60 shrink-0 self-end lg:self-auto">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'table' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Vue Tableau"
              >
                <List size={16} />
                <span className="hidden sm:inline">Tableau</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'grid' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Vue Grille"
              >
                <LayoutGrid size={16} />
                <span className="hidden sm:inline">Grille</span>
              </button>
            </div>

          </div>

          {/* Ligne filtres ciblés (Médecin + Date Personnalisée) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/40">
            
            {/* Filtre Médecin */}
            <div className="relative">
              <select
                value={filterMedecin}
                onChange={e => setFilterMedecin(e.target.value)}
                className="medibook-input w-full text-xs font-semibold bg-card text-foreground cursor-pointer h-10 rounded-xl"
              >
                <option value="">Tous les médecins du cabinet ({medecins.length})</option>
                {medecins.map(m => (
                  <option key={m.id} value={m.id}>
                    Dr. {m.prenom} {m.nom} {m.specialiteNom ? `— ${m.specialiteNom}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date personnalisée */}
            <div className="relative flex items-center gap-2">
              <input
                type="date"
                value={customDate}
                onChange={e => {
                  setCustomDate(e.target.value);
                  setDateQuickFilter('ALL');
                }}
                className="medibook-input text-xs font-semibold h-10 rounded-xl flex-1"
              />
              {customDate && (
                <button
                  onClick={() => setCustomDate('')}
                  className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground text-xs"
                  title="Effacer la date"
                >
                  <X size={14} />
                </button>
              )}
            </div>

          </div>

          {/* Indicateur de filtres */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
              <span>Filtres actifs : <strong className="text-foreground font-bold">{filteredRdvs.length}</strong> rendez-vous affiché(s)</span>
              <button
                onClick={resetFilters}
                className="text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <X size={13} /> Réinitialiser les filtres
              </button>
            </div>
          )}

        </div>

        {/* Chargement initial */}
        {loading && rdvs.length === 0 ? (
          <TableSkeleton rows={6} />
        ) : filteredRdvs.length === 0 ? (
          
          /* État vide */
          <div className="medibook-card bg-card text-center py-16 px-6 rounded-3xl border border-dashed border-border space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
              <ListFilter size={28} />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {activeTab === 'CONFIRME' && 'Aucun rendez-vous à venir trouvé'}
              {activeTab === 'TERMINE' && 'Aucune consultation terminée dans l’historique'}
              {activeTab === 'ANNULE' && 'Aucun rendez-vous annulé'}
              {activeTab === 'ALL' && 'Aucun rendez-vous trouvé'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {activeTab === 'CONFIRME' 
                ? 'Tous les rendez-vous confirmés du cabinet sont honorés ou modifiez votre plage de date.' 
                : 'Modifiez vos filtres de recherche pour afficher d’autres résultats.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="medibook-btn text-xs px-4 py-2 rounded-xl font-bold mt-2"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

        ) : viewMode === 'table' ? (

          /* === VUE TABLEAU === */
          <div className="medibook-card p-0 overflow-hidden rounded-3xl border border-border/80 shadow-xs bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="medibook-table-header text-muted-foreground font-bold border-b border-border/80 bg-muted/40">
                    <th className="px-5 py-4 text-left">Date & Créneau</th>
                    <th className="px-5 py-4 text-left">Patient</th>
                    <th className="px-5 py-4 text-left">Médecin Attribué</th>
                    <th className="px-5 py-4 text-left">Motif Consultation</th>
                    <th className="px-5 py-4 text-center">Statut</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredRdvs.map(rv => (
                    <tr 
                      key={rv.id} 
                      className="medibook-table-row hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => setSelectedRdv(rv)}
                    >
                      {/* Date & Heure */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center shrink-0 font-bold">
                            <span className="text-[10px] uppercase">{new Date(rv.date).toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                            <span className="text-xs leading-none">{new Date(rv.date).getDate()}</span>
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-xs">{rv.date}</p>
                            <p className="text-[11px] font-semibold text-primary flex items-center gap-1 mt-0.5">
                              <Clock size={11} />
                              {rv.heureDebut?.slice(0, 5)} — {rv.heureFin?.slice(0, 5)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 text-foreground font-extrabold text-xs flex items-center justify-center shrink-0 border border-border">
                            {rv.patientPrenom?.[0] || <User size={14} />}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                              {rv.patientPrenom} {rv.patientNom}
                            </p>
                            {rv.patientTelephone && (
                              <a 
                                href={`tel:${rv.patientTelephone}`}
                                onClick={e => e.stopPropagation()} 
                                className="text-[11px] text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5"
                              >
                                <Phone size={11} className="text-emerald-500" />
                                {rv.patientTelephone}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Médecin */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-xl bg-secondary/20 text-secondary-foreground flex items-center justify-center shrink-0">
                            <Stethoscope size={14} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-xs">Dr. {rv.medecinPrenom} {rv.medecinNom}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">Cabinet Médical</p>
                          </div>
                        </div>
                      </td>

                      {/* Motif */}
                      <td className="px-5 py-4 text-muted-foreground max-w-[200px]">
                        <p className="truncate font-medium text-xs text-foreground/90" title={rv.motif || 'Consultation standard'}>
                          {rv.motif || 'Consultation médicale'}
                        </p>
                      </td>

                      {/* Statut */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <StatusBadge status={rv.statut} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          
                          {/* Détails */}
                          <button
                            onClick={() => setSelectedRdv(rv)}
                            className="p-2 rounded-xl bg-muted/60 text-foreground hover:bg-primary/10 hover:text-primary transition-all font-semibold text-xs flex items-center gap-1"
                            title="Voir la fiche rendez-vous"
                          >
                            <Eye size={15} />
                            <span className="sr-only sm:not-sr-only">Détails</span>
                          </button>

                          {/* Annuler */}
                          {peutAnnuler(rv) && (
                            <button
                              disabled={actionLoading === rv.id}
                              onClick={() => setRdvToCancel(rv)}
                              className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all font-bold text-xs flex items-center gap-1 disabled:opacity-50"
                              title="Annuler le rendez-vous"
                            >
                              <XCircle size={15} />
                              <span className="hidden md:inline">Annuler</span>
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        ) : (

          /* === VUE GRILLE === */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRdvs.map(rv => (
              <div
                key={rv.id}
                onClick={() => setSelectedRdv(rv)}
                className="medibook-card bg-card p-5 rounded-3xl border border-border hover:border-primary/50 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                {/* En-tête Carte */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary font-black text-base flex items-center justify-center shrink-0 border border-primary/20">
                      {rv.patientPrenom?.[0] || <User size={18} />}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors">
                        {rv.patientPrenom} {rv.patientNom}
                      </h4>
                      {rv.patientTelephone && (
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                          <Phone size={11} className="text-emerald-500" />
                          {rv.patientTelephone}
                        </p>
                      )}
                    </div>
                  </div>

                  <StatusBadge status={rv.statut} />
                </div>

                {/* Bloc Heure & Médecin */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span className="flex items-center gap-1.5 text-primary">
                      <CalendarIcon size={14} />
                      {rv.date}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground font-medium">
                      <Clock size={14} />
                      {rv.heureDebut?.slice(0, 5)} - {rv.heureFin?.slice(0, 5)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center gap-1.5 text-foreground font-semibold">
                    <Stethoscope size={13} className="text-primary shrink-0" />
                    <span className="truncate">Dr. {rv.medecinPrenom} {rv.medecinNom}</span>
                  </div>

                  {rv.motif && (
                    <p className="text-[11px] text-muted-foreground italic truncate">
                      « {rv.motif} »
                    </p>
                  )}
                </div>

                {/* Boutons d'action carte */}
                <div className="flex items-center justify-between gap-2 pt-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedRdv(rv)}
                    className="flex-1 py-2 px-3 rounded-xl bg-muted text-foreground hover:bg-primary/10 hover:text-primary transition-all text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Eye size={14} />
                    <span>Fiche complète</span>
                  </button>

                  {peutAnnuler(rv) && (
                    <button
                      disabled={actionLoading === rv.id}
                      onClick={() => setRdvToCancel(rv)}
                      className="py-2 px-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <XCircle size={14} />
                      <span>Annuler</span>
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>

        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL FICHE DETAILEE RDV */}
      {/* ========================================================================= */}
      {selectedRdv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="medibook-card bg-card p-6 rounded-3xl border border-border shadow-2xl max-w-lg w-full space-y-6 relative overflow-hidden">
            
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">Détails du Rendez-vous</h3>
                  <p className="text-xs text-muted-foreground font-medium">Référence RDV #{selectedRdv.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRdv(null)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/60">
                <span className="font-bold text-muted-foreground uppercase text-[11px]">Statut Actuel</span>
                <StatusBadge status={selectedRdv.statut} />
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2">
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-primary flex items-center gap-1.5">
                  <User size={13} /> Informations Patient
                </p>
                <div className="grid grid-cols-2 gap-2 text-foreground font-medium pt-1">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Nom & Prénom</span>
                    <strong className="text-sm font-extrabold">{selectedRdv.patientPrenom} {selectedRdv.patientNom}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Téléphone</span>
                    {selectedRdv.patientTelephone ? (
                      <a href={`tel:${selectedRdv.patientTelephone}`} className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline">
                        <Phone size={12} /> {selectedRdv.patientTelephone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Non renseigné</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-3">
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-primary flex items-center gap-1.5">
                  <Stethoscope size={13} /> Médecin & Horaire
                </p>
                <div className="grid grid-cols-2 gap-2 text-foreground font-medium">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Médecin</span>
                    <p className="font-bold text-foreground">Dr. {selectedRdv.medecinPrenom} {selectedRdv.medecinNom}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Date & Heure</span>
                    <p className="font-bold text-primary flex items-center gap-1">
                      <CalendarIcon size={12} /> {selectedRdv.date}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedRdv.heureDebut?.slice(0, 5)} - {selectedRdv.heureFin?.slice(0, 5)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-muted-foreground block text-[11px] font-bold">Motif de consultation</span>
                <p className="text-foreground font-semibold text-xs italic">
                  « {selectedRdv.motif || 'Aucun motif spécifique précisé'} »
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              {peutAnnuler(selectedRdv) && (
                <button
                  disabled={actionLoading === selectedRdv.id}
                  onClick={() => setRdvToCancel(selectedRdv)}
                  className="px-4 py-2.5 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <XCircle size={15} />
                  Annuler ce RDV
                </button>
              )}

              <button
                onClick={() => setSelectedRdv(null)}
                className="px-5 py-2.5 rounded-2xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIALOG CONFIRMATION D'ANNULATION */}
      {/* ========================================================================= */}
      {rdvToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="medibook-card bg-card p-6 rounded-3xl border border-destructive/30 shadow-2xl max-w-md w-full space-y-5 text-center">
            
            <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <XCircle size={32} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-foreground">Confirmer l'annulation</h3>
              <p className="text-xs text-muted-foreground">
                Êtes-vous sûr de vouloir annuler le rendez-vous de <strong className="text-foreground">{rdvToCancel.patientPrenom} {rdvToCancel.patientNom}</strong> le <strong className="text-foreground">{rdvToCancel.date}</strong> à {rdvToCancel.heureDebut?.slice(0, 5)} ?
              </p>
              <p className="text-[11px] text-rose-500 font-semibold pt-1">
                Le créneau sera de nouveau libéré dans le planning du médecin.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setRdvToCancel(null)}
                className="px-4 py-2.5 rounded-2xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all"
              >
                Conserver le RDV
              </button>

              <button
                disabled={actionLoading === rdvToCancel.id}
                onClick={() => handleAnnuler(rdvToCancel.id)}
                className="px-5 py-2.5 rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-extrabold transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading === rdvToCancel.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <XCircle size={16} />
                )}
                Oui, Annuler
              </button>
            </div>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default SecretaireRendezVousPage;
