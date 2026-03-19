import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { mockExceptions } from '@/data/mockExceptions';
import { Plus, Trash2, CalendarX } from 'lucide-react';
import { toast } from 'sonner';

const ExceptionsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const myExceptions = mockExceptions.filter(e => e.medecinId === 'm1');

  // Get days of month for calendar display
  const today = new Date(2026, 2, 1); // March 2026
  const daysInMonth = new Date(2026, 3, 0).getDate();
  const firstDayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isException = (day: number) => myExceptions.some(e => {
    const d = new Date(e.date);
    return d.getDate() === day && d.getMonth() === 2 && d.getFullYear() === 2026;
  });

  return (
    <DashboardLayout title="Exceptions Planning">
      <div className="space-y-6">
        <div className="flex justify-end">
          <button onClick={() => setModalOpen(true)} className="medibook-btn flex items-center gap-2"><Plus size={18} /> Nouvelle Exception</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="medibook-card">
            <h3 className="font-semibold mb-4">Mars 2026</h3>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <div key={d} className="py-2 font-medium text-muted-foreground">{d}</div>)}
              {Array.from({ length: firstDayOfWeek }, (_, i) => <div key={`empty-${i}`} />)}
              {days.map(d => (
                <div key={d} className={`py-2 rounded-lg text-sm ${isException(d) ? 'bg-destructive/15 text-destructive font-semibold' : d === 18 ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-muted'}`}>{d}</div>
              ))}
            </div>
          </div>

          <div className="medibook-card">
            <h3 className="font-semibold mb-4">Liste des exceptions</h3>
            <div className="space-y-3">
              {myExceptions.map(ex => (
                <div key={ex.id} className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                  <div>
                    <div className="flex items-center gap-2"><CalendarX size={16} className="text-destructive" /><p className="text-sm font-medium">{ex.date}</p></div>
                    <p className="text-xs text-muted-foreground mt-1">{ex.journeeComplete ? 'Journée complète' : `${ex.heureDebut} - ${ex.heureFin}`}</p>
                    <p className="text-xs text-muted-foreground">{ex.motif}</p>
                  </div>
                  <button onClick={() => setDeleteId(ex.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle exception">
        <div className="space-y-4">
          <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Date</label><input type="date" className="medibook-input w-full" /></div>
          <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Type</label><select className="medibook-input w-full"><option value="ABSENT">Absent</option></select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Heure début (optionnel)</label><input type="time" className="medibook-input w-full" /></div>
            <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Heure fin (optionnel)</label><input type="time" className="medibook-input w-full" /></div>
          </div>
          <div><label className="text-sm font-medium text-secondary-foreground mb-1.5 block">Motif</label><textarea className="medibook-input w-full min-h-[80px] resize-none" /></div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModalOpen(false)} className="medibook-btn-outline h-10 px-4 text-sm">Annuler</button>
            <button onClick={() => { toast.success('Exception créée'); setModalOpen(false); }} className="medibook-btn h-10 px-4 text-sm">Créer</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} title="Supprimer l'exception" message="Êtes-vous sûr ?" onConfirm={() => { toast.success('Exception supprimée'); setDeleteId(null); }} onCancel={() => setDeleteId(null)} confirmLabel="Supprimer" />
    </DashboardLayout>
  );
};

export default ExceptionsPage;
