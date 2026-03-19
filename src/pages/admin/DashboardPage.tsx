import DashboardLayout from '@/layouts/DashboardLayout';
import StatsCard from '@/components/common/StatsCard';
import { Users, UserCheck, CalendarDays, Stethoscope } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { mockRendezVous } from '@/data/mockRendezVous';

const statusData = [
  { name: 'En attente', value: mockRendezVous.filter(r => r.statut === 'EN_ATTENTE').length, fill: 'hsl(33, 100%, 58%)' },
  { name: 'Confirmés', value: mockRendezVous.filter(r => r.statut === 'CONFIRME').length, fill: 'hsl(123, 38%, 57%)' },
  { name: 'Terminés', value: mockRendezVous.filter(r => r.statut === 'TERMINE').length, fill: 'hsl(200, 10%, 55%)' },
  { name: 'Annulés', value: mockRendezVous.filter(r => r.statut === 'ANNULE').length, fill: 'hsl(1, 84%, 63%)' },
];

const specData = [
  { name: 'Médecine Générale', value: 8 },
  { name: 'Cardiologie', value: 5 },
  { name: 'Ophtalmologie', value: 3 },
];

const AdminDashboard = () => (
  <DashboardLayout title="Dashboard Admin">
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard icon={Stethoscope} value={5} label="Médecins" color="green" />
        <StatsCard icon={Users} value={3} label="Secrétaires" color="blue" />
        <StatsCard icon={UserCheck} value={150} label="Patients" color="orange" />
        <StatsCard icon={CalendarDays} value={mockRendezVous.length} label="Rendez-vous" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="medibook-card">
          <h3 className="font-semibold mb-4">RDV par statut</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,88%)" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="value" radius={[8, 8, 0, 0]}>{statusData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="medibook-card">
          <h3 className="font-semibold mb-4">RDV par spécialité</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={specData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,88%)" /><XAxis type="number" tick={{ fontSize: 12 }} /><YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={120} /><Tooltip /><Bar dataKey="value" fill="hsl(122, 46%, 33%)" radius={[0, 8, 8, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="medibook-card">
        <h3 className="font-semibold mb-4">Activité récente</h3>
        <div className="space-y-3">
          {mockRendezVous.slice(0, 5).map(rv => (
            <div key={rv.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div><p className="text-sm font-medium">{rv.patientNom}</p><p className="text-xs text-muted-foreground">{rv.medecinNom} · {rv.motif}</p></div>
              <div className="text-right"><p className="text-sm">{rv.date}</p><span className={`medibook-badge text-xs ${rv.statut === 'EN_ATTENTE' ? 'bg-status-pending/15 text-status-pending' : rv.statut === 'CONFIRME' ? 'bg-status-confirmed/15 text-status-confirmed' : rv.statut === 'TERMINE' ? 'bg-status-completed/15 text-status-completed' : 'bg-status-cancelled/15 text-status-cancelled'}`}>{rv.statut === 'EN_ATTENTE' ? 'En attente' : rv.statut === 'CONFIRME' ? 'Confirmé' : rv.statut === 'TERMINE' ? 'Terminé' : 'Annulé'}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default AdminDashboard;
