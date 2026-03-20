import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { mockExceptions } from '@/data/mockExceptions';
import { mockMedecins } from '@/data/mockUsers';
import { Plus, Trash2, CalendarX } from 'lucide-react';
import { toast } from 'sonner';

const SecretaireExceptionsPage = () => {
  const [selectedMedecin, setSelectedMedecin] = useState('m1');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const exceptions = mockExceptions.filter(e => e.medecinId === selectedMedecin);

  return (
    <DashboardLayout title="Exceptions Planning">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <select value={selectedMedecin} onChange={e => setSelectedMedecin(e.target.value)} className="medibook-input text-sm">
            {mockMedecins.map(m => <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>)}
          </select>
          <button onClick={() => setModalOpen(true)} className="medibook-btn flex items-center gap-2"><Plus size={18} /> Nouvelle Exception</button>
        </div>
        <div className="medibook-card">
          <div className="space-y-3">
            {exceptions.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Aucune exception pour ce médecin</p> : exceptions.map(ex => (
              <div key={ex.id} className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                <div><div className="flex items-center gap-2"><CalendarX size={16} className="text-destructive" /><p className="text-sm font-medium">{ex.date}</p></div><p className="text-xs text-muted-foreground mt-1">{ex.journeeComplete ? 'Journée complète' : `${ex.heureDebut} - ${ex.heureFin}`} · {ex.motif}</p></div>
                <button onClick={() => setDeleteId(ex.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle exception">
        <div className="space-y-4">
          <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Date</label><input type="date" className="medibook-input w-full" /></div>
          <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Type</label><select className="medibook-input w-full"><option value="ABSENT">Absent</option></select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Heure début</label><input type="time" className="medibook-input w-full" /></div>
            <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Heure fin</label><input type="time" className="medibook-input w-full" /></div>
          </div>
          <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Motif</label><textarea className="medibook-input w-full min-h-[80px] resize-none" /></div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModalOpen(false)} className="medibook-btn-outline h-10 px-4 text-sm">Annuler</button>
            <button onClick={() => { toast.success('Exception créée'); setModalOpen(false); }} className="medibook-btn h-10 px-4 text-sm">Créer</button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} title="Supprimer" message="Êtes-vous sûr ?" onConfirm={() => { toast.success('Supprimée'); setDeleteId(null); }} onCancel={() => setDeleteId(null)} confirmLabel="Supprimer" />
    </DashboardLayout>
  );
};

export default SecretaireExceptionsPage;
