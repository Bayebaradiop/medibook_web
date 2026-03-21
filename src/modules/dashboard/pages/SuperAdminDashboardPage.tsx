import DashboardLayout from '@/layouts/DashboardLayout';
import StatsCard from '@/components/common/StatsCard';
import { Building2, Users, UserCheck, CalendarDays } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { mockCabinets } from '@/data/mockCabinets';

const statusData = [
  { name: 'En attente', value: 24, fill: 'hsl(33, 100%, 58%)' },
  { name: 'Confirmés', value: 45, fill: 'hsl(var(--status-confirmed))' },
  { name: 'Terminés', value: 120, fill: 'hsl(200, 10%, 55%)' },
  { name: 'Annulés', value: 8, fill: 'hsl(1, 84%, 63%)' },
];

const cabinetData = [
  { name: 'Medibook', value: 65, fill: 'hsl(var(--primary))' },
  { name: 'Sud', value: 40, fill: 'hsl(var(--primary-light))' },
  { name: 'Santé Plus', value: 15, fill: 'hsl(200, 10%, 55%)' },
];

const SuperAdminDashboard = () => (
  <DashboardLayout title="Dashboard Super Admin">
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard icon={Building2} value={mockCabinets.length} label="Total Cabinets" color="green" variation="↑ +1 ce mois" />
        <StatsCard icon={Users} value={12} label="Total Médecins" color="blue" />
        <StatsCard icon={UserCheck} value={350} label="Total Patients" color="orange" />
        <StatsCard icon={CalendarDays} value={197} label="Total RDV" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="medibook-card">
          <h3 className="font-semibold mb-4">RDV par statut</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,88%)" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="value" radius={[8, 8, 0, 0]}>{statusData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="medibook-card">
          <h3 className="font-semibold mb-4">Répartition par cabinet</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart><Pie data={cabinetData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={{ fontSize: 12 }}>{cabinetData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Pie><Legend /><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="medibook-card">
        <h3 className="font-semibold mb-4">Derniers cabinets créés</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="medibook-table-header"><th className="px-4 py-3 text-left">Nom</th><th className="px-4 py-3 text-left">Adresse</th><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Statut</th></tr></thead>
            <tbody>
              {mockCabinets.map(c => (
                <tr key={c.id} className="medibook-table-row">
                  <td className="px-4 py-3 font-medium">{c.nom}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.adresse}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.dateCreation}</td>
                  <td className="px-4 py-3"><span className={`medibook-badge ${c.statut === 'ACTIF' ? 'bg-status-active/15 text-status-active' : 'bg-status-inactive/15 text-status-inactive'}`}>{c.statut === 'ACTIF' ? 'Actif' : 'Inactif'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default SuperAdminDashboard;
