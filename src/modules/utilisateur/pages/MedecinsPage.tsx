import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import SearchInput from '@/components/common/SearchInput';
import StatusBadge from '@/components/common/StatusBadge';
import { medecinService } from '../services/utilisateurService';
import { specialiteService } from '@/modules/specialite/services/specialiteService';
import { UTILISATEUR_ERREURS } from '../messages/utilisateur.erreurs';
import type { Medecin } from '../types/utilisateur.types';
import type { Specialite } from '@/modules/specialite/types/specialite.types';
import { Plus, LayoutGrid, List, Loader2, Stethoscope, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

const Avatar = ({ photo, prenom, nom, size = 'md' }: { photo?: string; prenom: string; nom: string; size?: 'sm' | 'md' | 'lg' }) => {
  const initials = `${prenom[0] || ''}${nom[0] || ''}`;
  const sizeMap = { sm: 'h-10 w-10 text-xs', md: 'h-14 w-14 text-lg', lg: 'h-16 w-16 text-xl' };
  const cls = sizeMap[size];
  return photo ? (
    <img src={photo} alt={`${prenom} ${nom}`} className={`${cls} rounded-xl object-cover shadow-sm flex-shrink-0`} />
  ) : (
    <div className={`${cls} flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-white font-bold shadow-sm flex-shrink-0`}>{initials}</div>
  );
};

const MedecinsPage = () => {
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterSpec, setFilterSpec] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();

  const charger = useCallback(async () => {
    try {
      setLoading(true);
      const [medsRes, specsRes] = await Promise.all([
        medecinService.list(),
        specialiteService.list(),
      ]);
      setMedecins(medsRes.data);
      setSpecialites(specsRes.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || UTILISATEUR_ERREURS.CHARGEMENT_ECHOUE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const filtered = medecins.filter(m => {
    const matchSearch = `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase());
    const matchSpec = !filterSpec || m.specialiteId === Number(filterSpec);
    const matchStatus = !filterStatus || m.status === filterStatus;
    return matchSearch && matchSpec && matchStatus;
  });

  return (
    <DashboardLayout title="Médecins">
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un médecin..." />
            <select value={filterSpec} onChange={e => setFilterSpec(e.target.value)} className="medibook-input text-sm">
              <option value="">Toutes les spécialités</option>
              {specialites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
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
            <button onClick={() => navigate('/admin/medecins/nouveau')} className="medibook-btn flex items-center gap-2 whitespace-nowrap"><Plus size={18} /> Nouveau Médecin</button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : filtered.length === 0 ? (
          <div className="medibook-card p-12 text-center"><p className="text-muted-foreground">Aucun médecin trouvé</p></div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(m => (
              <div key={m.id} onClick={() => navigate(`/admin/medecins/${m.id}`)} className="medibook-card p-0 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-0.5">
                {/* Card top accent */}
                <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-transparent" />
                <div className="p-5">
                  {/* Header: photo + identity */}
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar photo={m.photo} prenom={m.prenom} nom={m.nom} />
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="font-bold text-base truncate group-hover:text-primary transition-colors">{m.prenom} {m.nom}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Stethoscope size={13} className="text-primary flex-shrink-0" />
                        <span className="text-xs font-medium text-primary truncate">{m.specialiteNom}</span>
                      </div>
                    </div>
                    <StatusBadge status={m.status} type="entity" />
                  </div>

                  {/* Info rows */}
                  <div className="space-y-2 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Mail size={14} className="text-muted-foreground/60 flex-shrink-0" />
                      <span className="truncate">{m.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Phone size={14} className="text-muted-foreground/60 flex-shrink-0" />
                      <span>{m.telephone}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="medibook-card p-0 overflow-hidden"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="medibook-table-header"><th className="px-4 py-3 text-left">Médecin</th><th className="px-4 py-3 text-left">Spécialité</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Téléphone</th><th className="px-4 py-3 text-left">Statut</th></tr></thead>
              <tbody>{filtered.map(m => (
                <tr key={m.id} onClick={() => navigate(`/admin/medecins/${m.id}`)} className="medibook-table-row cursor-pointer hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar photo={m.photo} prenom={m.prenom} nom={m.nom} size="sm" /><span className="font-medium">{m.prenom} {m.nom}</span></div></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1.5"><Stethoscope size={13} className="text-primary" /><span>{m.specialiteNom}</span></div></td>
                  <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.telephone}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} type="entity" /></td>
                </tr>
              ))}</tbody>
            </table>
          </div></div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MedecinsPage;
