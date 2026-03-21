import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { specialiteService } from '../services/specialiteService';
import { validerSpecialiteForm } from '../logique/specialite.validation';
import { SPECIALITE_ERREURS } from '../messages/specialite.erreurs';
import { SPECIALITE_SUCCES } from '../messages/specialite.succes';
import type { Specialite } from '../types/specialite.types';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SpecialitesPage = () => {
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Specialite | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [nom, setNom] = useState('');
  const [desc, setDesc] = useState('');
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  // Charger la liste depuis l'API
  const chargerSpecialites = useCallback(async () => {
    try {
      setLoading(true);
      const res = await specialiteService.list();
      setSpecialites(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || SPECIALITE_ERREURS.CHARGEMENT_ECHOUE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { chargerSpecialites(); }, [chargerSpecialites]);

  const openCreate = () => {
    setEditItem(null); setNom(''); setDesc(''); setErreurs({});
    setModalOpen(true);
  };
  const openEdit = (s: Specialite) => {
    setEditItem(s); setNom(s.nom); setDesc(s.description || ''); setErreurs({});
    setModalOpen(true);
  };

  // Enregistrer (créer ou modifier)
  const handleSave = async () => {
    const data = { nom, description: desc };
    const validation = validerSpecialiteForm(data);
    if (Object.keys(validation).length > 0) {
      setErreurs(validation);
      toast.error(Object.values(validation)[0]);
      return;
    }

    setSaving(true);
    try {
      if (editItem) {
        const res = await specialiteService.update(editItem.id, data);
        setSpecialites(prev => prev.map(s => s.id === editItem.id ? res.data : s));
        toast.success(SPECIALITE_SUCCES.MODIFICATION_REUSSIE);
      } else {
        const res = await specialiteService.create(data);
        setSpecialites(prev => [...prev, res.data]);
        toast.success(SPECIALITE_SUCCES.CREATION_REUSSIE);
      }
      setModalOpen(false);
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && typeof serverErrors === 'object') {
        setErreurs(serverErrors);
        toast.error(Object.values(serverErrors)[0] as string);
      } else {
        toast.error(err.response?.data?.message
          || (editItem ? SPECIALITE_ERREURS.MODIFICATION_ECHOUEE : SPECIALITE_ERREURS.CREATION_ECHOUEE));
      }
    } finally {
      setSaving(false);
    }
  };

  // Supprimer
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await specialiteService.delete(deleteId);
      setSpecialites(prev => prev.filter(s => s.id !== deleteId));
      toast.success(SPECIALITE_SUCCES.SUPPRESSION_REUSSIE);
    } catch (err: any) {
      toast.error(err.response?.data?.message || SPECIALITE_ERREURS.SUPPRESSION_ECHOUEE);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <DashboardLayout title="Spécialités">
      <div className="space-y-4">
        <div className="flex justify-end">
          <button onClick={openCreate} className="medibook-btn flex items-center gap-2">
            <Plus size={18} /> Nouvelle Spécialité
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : specialites.length === 0 ? (
          <div className="medibook-card p-8 text-center text-muted-foreground">
            Aucune spécialité pour le moment
          </div>
        ) : (
          <div className="medibook-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="medibook-table-header">
                    <th className="px-4 py-3 text-left">Nom</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {specialites.map(s => (
                    <tr key={s.id} className="medibook-table-row">
                      <td className="px-4 py-3 font-medium">{s.nom}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.description}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setDeleteId(s.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Modifier la spécialité' : 'Nouvelle spécialité'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Nom</label>
            <input value={nom} onChange={e => { setNom(e.target.value); setErreurs(prev => ({ ...prev, nom: '' })); }} className={`medibook-input w-full ${erreurs.nom ? 'border-destructive' : ''}`} />
            {erreurs.nom && <p className="text-xs text-destructive mt-1">{erreurs.nom}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} className="medibook-input w-full min-h-[80px] resize-none" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModalOpen(false)} className="medibook-btn-outline h-10 px-4 text-sm">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="medibook-btn h-10 px-4 text-sm">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Supprimer la spécialité"
        message="Êtes-vous sûr de vouloir supprimer cette spécialité ?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel="Supprimer"
      />
    </DashboardLayout>
  );
};

export default SpecialitesPage;
