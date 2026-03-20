import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { mockSpecialites } from '@/data/mockSpecialites';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const SpecialitesPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [nom, setNom] = useState('');
  const [desc, setDesc] = useState('');

  const openCreate = () => { setEditItem(null); setNom(''); setDesc(''); setModalOpen(true); };
  const openEdit = (s: any) => { setEditItem(s); setNom(s.nom); setDesc(s.description); setModalOpen(true); };

  return (
    <DashboardLayout title="Spécialités">
      <div className="space-y-4">
        <div className="flex justify-end">
          <button onClick={openCreate} className="medibook-btn flex items-center gap-2"><Plus size={18} /> Nouvelle Spécialité</button>
        </div>
        <div className="medibook-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="medibook-table-header"><th className="px-4 py-3 text-left">Nom</th><th className="px-4 py-3 text-left">Description</th><th className="px-4 py-3 text-left">Nb Médecins</th><th className="px-4 py-3 text-left">Actions</th></tr></thead>
              <tbody>
                {mockSpecialites.map(s => (
                  <tr key={s.id} className="medibook-table-row">
                    <td className="px-4 py-3 font-medium">{s.nom}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.description}</td>
                    <td className="px-4 py-3">{s.nbMedecins}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-muted transition-colors"><Pencil size={16} /></button>
                        <button onClick={() => setDeleteId(s.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Modifier la spécialité' : 'Nouvelle spécialité'}>
        <div className="space-y-4">
          <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Nom</label><input value={nom} onChange={e => setNom(e.target.value)} className="medibook-input w-full" /></div>
          <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Description</label><textarea value={desc} onChange={e => setDesc(e.target.value)} className="medibook-input w-full min-h-[80px] resize-none" /></div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModalOpen(false)} className="medibook-btn-outline h-10 px-4 text-sm">Annuler</button>
            <button onClick={() => { toast.success('Spécialité enregistrée'); setModalOpen(false); }} className="medibook-btn h-10 px-4 text-sm">Enregistrer</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} title="Supprimer la spécialité" message="Êtes-vous sûr de vouloir supprimer cette spécialité ?" onConfirm={() => { toast.success('Spécialité supprimée'); setDeleteId(null); }} onCancel={() => setDeleteId(null)} confirmLabel="Supprimer" />
    </DashboardLayout>
  );
};

export default SpecialitesPage;
