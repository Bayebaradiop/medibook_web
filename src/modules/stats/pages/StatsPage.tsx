import DashboardLayout from '@/layouts/DashboardLayout';
import StatsCard from '@/components/common/StatsCard';
import { CalendarDays, Clock, CheckCircle, XCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockRendezVous } from '@/data/mockRendezVous';

const weeklyData = [
  { semaine: 'S10', rdv: 8 }, { semaine: 'S11', rdv: 12 }, { semaine: 'S12', rdv: 10 }, { semaine: 'S13', rdv: 15 },
];

const myRdvs = mockRendezVous.filter(r => r.medecinId === 'm1');
const pieData = [
  { name: 'En attente', value: myRdvs.filter(r => r.statut === 'EN_ATTENTE').length, fill: 'hsl(33, 100%, 58%)' },
  { name: 'Confirmés', value: myRdvs.filter(r => r.statut === 'CONFIRME').length, fill: 'hsl(var(--status-confirmed))' },
  { name: 'Terminés', value: myRdvs.filter(r => r.statut === 'TERMINE').length, fill: 'hsl(200, 10%, 55%)' },
  { name: 'Annulés', value: myRdvs.filter(r => r.statut === 'ANNULE').length, fill: 'hsl(1, 84%, 63%)' },
];

const dayData = [
  { jour: 'Lun', rdv: 5 }, { jour: 'Mar', rdv: 3 }, { jour: 'Mer', rdv: 4 },
  { jour: 'Jeu', rdv: 6 }, { jour: 'Ven', rdv: 7 }, { jour: 'Sam', rdv: 1 }, { jour: 'Dim', rdv: 0 },
];

const StatsPage = () => (
  <DashboardLayout title="Statistiques">
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard icon={CalendarDays} value={myRdvs.length} label="Total RDV" color="green" />
        <StatsCard icon={Clock} value={myRdvs.filter(r => r.statut === 'EN_ATTENTE').length} label="En attente" color="orange" />
        <StatsCard icon={CheckCircle} value={myRdvs.filter(r => r.statut === 'CONFIRME').length} label="Confirmés" color="blue" />
        <StatsCard icon={XCircle} value={myRdvs.filter(r => r.statut === 'TERMINE').length} label="Terminés" color="grey" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="medibook-card">
          <h3 className="font-semibold mb-4">RDV par semaine</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,88%)" /><XAxis dataKey="semaine" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Line type="monotone" dataKey="rdv" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} /></LineChart>
          </ResponsiveContainer>
        </div>
        <div className="medibook-card">
          <h3 className="font-semibold mb-4">Répartition par statut</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={{ fontSize: 12 }}>{pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Pie><Legend /><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
        <div className="medibook-card lg:col-span-2">
          <h3 className="font-semibold mb-4">RDV par jour de la semaine</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dayData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,88%)" /><XAxis dataKey="jour" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="rdv" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default StatsPage;
