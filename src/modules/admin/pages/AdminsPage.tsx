import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { adminService } from '../services/adminService';
import type { Utilisateur } from '@/modules/auth/types/auth.types';
import {
  Loader2,
  Mail,
  Phone,
  Building2,
  Pencil,
  Search,
  X,
  CheckCircle2,
  XCircle,
  List,
  LayoutGrid,
  ShieldCheck,
  User,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

const AdminsPage = () => {
  const [admins, setAdmins] = useState<Utilisateur[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIF' | 'INACTIF'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const chargerAdmins = useCallback(async () => {
    try {
      const res = await adminService.list();
      const raw = (res.data as any)?.data;
      setAdmins(Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : []);
    } catch {
      toast.error("Erreur lors du chargement des admins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { chargerAdmins(); }, [chargerAdmins]);

  const handleToggleStatus = async (admin: Utilisateur) => {
    try {
      const res = await adminService.toggleStatus(admin.id);
      const updated = (res.data as any)?.data;
      if (updated) {
        setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, status: updated.status } : a));
      } else {
        setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, status: a.status === 'ACTIF' ? 'INACTIF' : 'ACTIF' } : a));
      }
      toast.success(`Admin ${admin.prenom} ${admin.nom} ${admin.status === 'ACTIF' ? 'désactivé' : 'activé'} avec succès`);
    } catch {
      toast.error("Erreur lors du changement de statut");
    }
  };

  const filtered = admins.filter(a => {
    const matchSearch =
      `${a.prenom} ${a.nom}`.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.cabinetNom || '').toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const totalActifs = admins.filter(a => a.status === 'ACTIF').length;
  const totalInactifs = admins.filter(a => a.status === 'INACTIF').length;

  const getInitials = (a: Utilisateur) => `${a.prenom?.[0] || ''}${a.nom?.[0] || ''}`.toUpperCase();

  if (loading) return (
    <DashboardLayout title="Gestion des Administrateurs">
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-sm font-medium text-muted-foreground">Chargement des comptes administrateurs...</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Gestion des Administrateurs">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* BARRE SUPÉRIEURE DE CONTRÔLE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Input Recherche & Filtres Statut */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un administrateur ou cabinet..."
                className="medibook-input w-full pl-10 pr-9 py-2.5 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Chips de filtrage par statut */}
            <div className="flex items-center gap-1 bg-secondary/40 p-1 rounded-2xl border border-border">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Tous ({admins.length})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIF')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  statusFilter === 'ACTIF'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CheckCircle2 size={12} className="text-emerald-500" />
                Actifs ({totalActifs})
              </button>
              <button
                onClick={() => setStatusFilter('INACTIF')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  statusFilter === 'INACTIF'
                    ? 'bg-muted text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <XCircle size={12} className="text-muted-foreground" />
                Inactifs ({totalInactifs})
              </button>
            </div>
          </div>

          {/* Commutateur de mode d'affichage */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center bg-secondary/40 p-1 rounded-2xl border border-border">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'table' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Vue Tableau"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'grid' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Vue Grille Cartes"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* AFFICHAGE DES RÉSULTATS */}
        {filtered.length === 0 ? (
          <div className="medibook-card p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-1">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-lg font-bold text-foreground">Aucun administrateur trouvé</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {search || statusFilter !== 'ALL'
                ? 'Aucun administrateur ne correspond à vos filtres actuels.'
                : 'Les administrateurs sont créés lors de la configuration des cabinets.'}
            </p>
            {search && (
              <button
                onClick={() => { setSearch(''); setStatusFilter('ALL'); }}
                className="mt-2 text-xs font-semibold text-primary hover:underline"
              >
                Réinitialiser la recherche
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* VUE TABLEAU */
          <div className="medibook-card p-0 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border/70 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-4">Administrateur</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">Cabinet Assigné</th>
                    <th className="px-5 py-4">Statut</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map(a => (
                    <tr key={a.id} className="hover:bg-muted/30 transition-colors group">
                      {/* Avatar & Nom */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                            {getInitials(a)}
                          </div>
                          <div>
                            <span className="font-bold text-foreground block text-sm group-hover:text-primary transition-colors">
                              {a.prenom} {a.nom}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">Administrateur de Cabinet</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <Mail size={13} className="text-primary" />
                            <span>{a.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone size={13} className="text-muted-foreground" />
                            <span>{a.telephone || '—'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Cabinet */}
                      <td className="px-5 py-4">
                        {a.cabinetNom ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold border border-border">
                            <Building2 size={13} className="text-primary" />
                            <span>{a.cabinetNom}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 italic">Non rattaché</span>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <StatusBadge status={a.status as any} type="entity" />
                          <button
                            onClick={() => handleToggleStatus(a)}
                            className="focus:outline-none"
                            title={a.status === 'ACTIF' ? 'Désactiver cet accès' : 'Activer cet accès'}
                          >
                            <div
                              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                                a.status === 'ACTIF' ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                                  a.status === 'ACTIF' ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </div>
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        {a.cabinetId && (
                          <button
                            onClick={() => navigate(`/super-admin/cabinets/${a.cabinetId}/modifier`)}
                            className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                            title="Modifier le cabinet"
                          >
                            <Pencil size={15} />
                            <span>Éditer Cabinet</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* VUE GRILLE DE CARTES */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(a => (
              <div
                key={a.id}
                className="medibook-card flex flex-col justify-between hover:border-primary/40 transition-all duration-200 group"
              >
                <div className="space-y-4">
                  {/* Header Carte : Avatar & Statut */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center font-extrabold text-base shadow-inner">
                        {getInitials(a)}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                          {a.prenom} {a.nom}
                        </h4>
                        <span className="text-xs text-muted-foreground font-medium block">Administrateur</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={a.status as any} type="entity" />
                      <button
                        onClick={() => handleToggleStatus(a)}
                        className="focus:outline-none"
                        title="Changer statut"
                      >
                        <div
                          className={`w-8 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                            a.status === 'ACTIF' ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform ${
                              a.status === 'ACTIF' ? 'translate-x-3.5' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Coordonnées & Cabinet */}
                  <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Mail size={14} className="text-primary shrink-0" />
                      <span className="truncate">{a.email}</span>
                    </div>
                    {a.telephone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone size={14} className="text-primary shrink-0" />
                        <span>{a.telephone}</span>
                      </div>
                    )}
                    {a.cabinetNom && (
                      <div className="flex items-center gap-2 text-muted-foreground pt-1">
                        <Building2 size={14} className="text-primary shrink-0" />
                        <span className="font-semibold text-foreground">{a.cabinetNom}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Carte */}
                {a.cabinetId && (
                  <div className="pt-4 mt-4 border-t border-border/60 flex justify-end">
                    <button
                      onClick={() => navigate(`/super-admin/cabinets/${a.cabinetId}/modifier`)}
                      className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Modifier Cabinet <ArrowRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminsPage;
