import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import SearchInput from '@/components/common/SearchInput';
import StatusBadge from '@/components/common/StatusBadge';
import { secretaireService } from '../services/utilisateurService';
import { UTILISATEUR_ERREURS } from '../messages/utilisateur.erreurs';
import type { Secretaire } from '../types/utilisateur.types';
import { Plus, LayoutGrid, List, Loader2, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

const Avatar = ({ photo, prenom, nom, size = 'md' }: { photo?: string; prenom: string; nom: string; size?: 'sm' | 'md' }) => {
  const initials = `${prenom[0] || ''}${nom[0] || ''}`;
  const cls = size === 'sm' ? 'h-10 w-10 text-xs' : 'h-14 w-14 text-lg';
  return photo ? (
    <img src={photo} alt={`${prenom} ${nom}`} className={`${cls} rounded-xl object-cover shadow-sm flex-shrink-0`} />
  ) : (
    <div className={`${cls} flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-white font-bold shadow-sm flex-shrink-0`}>{initials}</div>
  );
};

const SecretairesPage = () => {
  const [secretaires, setSecretaires] = useState<Secretaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();

  const charger = useCallback(async () => {
    try {
      setLoading(true);
      const res = await secretaireService.list();
      const raw = (res.data as any)?.data;
      setSecretaires(Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || UTILISATEUR_ERREURS.CHARGEMENT_ECHOUE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const filtered = secretaires.filter(s => {
    const matchSearch = `${s.prenom} ${s.nom}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout title="Secrétaires">
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <SearchInput value={search} onChange={setSearch} placeholder="Rechercher une secrétaire..." />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="medibook-input text-sm">
              <option value="">Tous les statuts</option>
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-border overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><LayoutGrid size={18} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><List size={18} /></button>
            </div>
            <button onClick={() => navigate('/admin/secretaires/nouveau')} className="medibook-btn flex items-center gap-2 whitespace-nowrap"><Plus size={18} /> Nouvelle Secrétaire</button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : filtered.length === 0 ? (
          <div className="medibook-card p-12 text-center"><p className="text-muted-foreground">Aucune secrétaire trouvée</p></div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(s => (
              <div key={s.id} onClick={() => navigate(`/admin/secretaires/${s.id}`)} className="medibook-card p-0 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-0.5">
                <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-transparent" />
                <div className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar photo={s.photo} prenom={s.prenom} nom={s.nom} />
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="font-bold text-base truncate group-hover:text-primary transition-colors">{s.prenom} {s.nom}</p>
                      {s.cabinetNom && <span className="text-xs text-muted-foreground">{s.cabinetNom}</span>}
                    </div>
                    <StatusBadge status={s.status} type="entity" />
                  </div>
                  <div className="space-y-2 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground"><Mail size={14} className="text-muted-foreground/60 flex-shrink-0" /><span className="truncate">{s.email}</span></div>
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground"><Phone size={14} className="text-muted-foreground/60 flex-shrink-0" /><span>{s.telephone}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="medibook-card p-0 overflow-hidden"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="medibook-table-header"><th className="px-4 py-3 text-left">Secrétaire</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Téléphone</th><th className="px-4 py-3 text-left">Statut</th></tr></thead>
              <tbody>{filtered.map(s => (
                <tr key={s.id} onClick={() => navigate(`/admin/secretaires/${s.id}`)} className="medibook-table-row cursor-pointer hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar photo={s.photo} prenom={s.prenom} nom={s.nom} size="sm" /><span className="font-medium">{s.prenom} {s.nom}</span></div></td>
                  <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.telephone}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} type="entity" /></td>
                </tr>
              ))}</tbody>
            </table>
          </div></div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SecretairesPage;
