import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { cabinetService } from '../services/cabinetService';
import { CABINET_ERREURS } from '../messages/cabinet.erreurs';
import { CABINET_SUCCES } from '../messages/cabinet.succes';
import type { Cabinet } from '../types/cabinet.types';
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  Building2,
  Search,
  MapPin,
  Phone,
  Mail,
  User,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
  X,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const CabinetsPage = () => {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIF' | 'INACTIF'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const navigate = useNavigate();

  const chargerCabinets = useCallback(async () => {
    try {
      const res = await cabinetService.list();
      const raw = (res.data as any)?.data;
      setCabinets(Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : []);
    } catch {
      toast.error(CABINET_ERREURS.CHARGEMENT_ECHOUE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { chargerCabinets(); }, [chargerCabinets]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await cabinetService.delete(confirmDelete);
      toast.success(CABINET_SUCCES.SUPPRESSION_REUSSIE);
      setCabinets(prev => prev.filter(c => c.id !== confirmDelete));
    } catch (err: any) {
      toast.error(err.response?.data?.message || CABINET_ERREURS.SUPPRESSION_ECHOUEE);
    }
    setConfirmDelete(null);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await cabinetService.toggleStatus(id);
      setCabinets(prev => prev.map(c => c.id === id ? res.data : c));
      toast.success(CABINET_SUCCES.STATUT_MODIFIE);
    } catch (err: any) {
      toast.error(err.response?.data?.message || CABINET_ERREURS.MODIFICATION_ECHOUEE);
    }
  };

  const filtered = cabinets.filter(c => {
    const matchSearch =
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      c.adresse.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.admin && `${c.admin.prenom} ${c.admin.nom}`.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const totalActifs = cabinets.filter(c => c.status === 'ACTIF').length;
  const totalInactifs = cabinets.filter(c => c.status === 'INACTIF').length;

  if (loading) return (
    <DashboardLayout title="Gestion des Cabinets">
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-sm font-medium text-muted-foreground">Chargement de la liste des cabinets...</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Gestion des Cabinets">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* BARRE SUPÉRIEURE DE CONTRÔLE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Recherche & Filtres Statut */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Input recherche */}
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par nom, adresse, admin..."
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
                Tous ({cabinets.length})
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

          {/* Mode d'affichage & Bouton d'ajout */}
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

            <button
              onClick={() => navigate('/super-admin/cabinets/nouveau')}
              className="medibook-btn flex items-center gap-2 whitespace-nowrap shadow-md"
            >
              <Plus size={18} />
              <span>Nouveau Cabinet</span>
            </button>
          </div>
        </div>

        {/* AFFICHAGE TABLEAU OU GRILLE */}
        {filtered.length === 0 ? (
          <div className="medibook-card p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-1">
              <Building2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-foreground">Aucun cabinet médical trouvé</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {search || statusFilter !== 'ALL'
                ? 'Essayez de modifier votre recherche ou vos filtres de statut.'
                : 'Commencez par créer le premier cabinet médical de votre plateforme.'}
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
          /* VUE TABLEAU HAUTE FIDÉLITÉ */
          <div className="medibook-card p-0 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border/70 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-4">Cabinet & Admin</th>
                    <th className="px-5 py-4">Adresse</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">Statut</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map(c => {
                    const primaryColor = c.couleurPrimaire || '#2F7D79';
                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        {/* Cabinet Nom + Logo + Admin */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-border shadow-inner font-extrabold text-sm overflow-hidden bg-background"
                              style={{ color: primaryColor }}
                            >
                              {c.logo ? (
                                <img src={c.logo} alt={c.nom} className="max-h-full max-w-full object-contain p-1" />
                              ) : (
                                <span>{c.nom.substring(0, 2).toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-foreground block text-sm group-hover:text-primary transition-colors">
                                {c.nom}
                              </span>
                              {c.admin ? (
                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <User size={12} className="text-primary" />
                                  {c.admin.prenom} {c.admin.nom}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground/60 italic">Aucun admin assigné</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Adresse */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground max-w-xs">
                            <MapPin size={14} className="shrink-0 text-primary" />
                            <span className="truncate">{c.adresse}</span>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-4">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-foreground font-medium">
                              <Phone size={13} className="text-muted-foreground" />
                              <span>{c.telephone}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail size={13} className="text-muted-foreground" />
                              <span className="truncate max-w-[180px]">{c.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Statut + Switch */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <StatusBadge status={c.status as any} type="entity" />
                            <button
                              onClick={() => handleToggleStatus(c.id)}
                              className="focus:outline-none"
                              title={c.status === 'ACTIF' ? 'Désactiver le cabinet' : 'Activer le cabinet'}
                            >
                              <div
                                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                                  c.status === 'ACTIF' ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                                    c.status === 'ACTIF' ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </div>
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => navigate(`/super-admin/cabinets/${c.id}`)}
                              className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                              title="Voir les détails"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => navigate(`/super-admin/cabinets/${c.id}/modifier`)}
                              className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                              title="Modifier"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(c.id)}
                              className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* VUE GRILLE DE CARTES */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(c => {
              const primaryColor = c.couleurPrimaire || '#2F7D79';
              return (
                <div
                  key={c.id}
                  className="medibook-card flex flex-col justify-between hover:border-primary/40 transition-all duration-200 group"
                >
                  <div className="space-y-4">
                    {/* Header Carte : Logo & Statut */}
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center border border-border shadow-inner font-extrabold text-base overflow-hidden bg-background"
                        style={{ color: primaryColor }}
                      >
                        {c.logo ? (
                          <img src={c.logo} alt={c.nom} className="max-h-full max-w-full object-contain p-1.5" />
                        ) : (
                          <span>{c.nom.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge status={c.status as any} type="entity" />
                        <button
                          onClick={() => handleToggleStatus(c.id)}
                          className="focus:outline-none"
                          title="Changer statut"
                        >
                          <div
                            className={`w-8 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                              c.status === 'ACTIF' ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform ${
                                c.status === 'ACTIF' ? 'translate-x-3.5' : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Nom & Admin */}
                    <div>
                      <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {c.nom}
                      </h4>
                      {c.admin ? (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                          <User size={13} className="text-primary" />
                          <span>Admin : {c.admin.prenom} {c.admin.nom}</span>
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/60 italic mt-1">Aucun admin assigné</p>
                      )}
                    </div>

                    {/* Informations adresse & contact */}
                    <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin size={14} className="text-primary shrink-0" />
                        <span className="truncate">{c.adresse}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone size={14} className="text-primary shrink-0" />
                        <span>{c.telephone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail size={14} className="text-primary shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer carte */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/60">
                    <button
                      onClick={() => navigate(`/super-admin/cabinets/${c.id}`)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      Détails <ArrowRight size={13} />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/super-admin/cabinets/${c.id}/modifier`)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(c.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Supprimer le cabinet"
        message="Êtes-vous sûr de vouloir supprimer ce cabinet ? Cette action est irréversible."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Supprimer"
      />
    </DashboardLayout>
  );
};

export default CabinetsPage;
