export interface Planning {
  id: string;
  medecinId: string;
  medecinNom: string;
  jour: string;
  heureDebut: string;
  heureFin: string;
  dureeCreneau: number;
}

export const mockPlannings: Planning[] = [
  { id: 'p1', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', jour: 'LUNDI', heureDebut: '08:00', heureFin: '12:00', dureeCreneau: 30 },
  { id: 'p2', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', jour: 'LUNDI', heureDebut: '14:00', heureFin: '17:00', dureeCreneau: 30 },
  { id: 'p3', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', jour: 'MERCREDI', heureDebut: '08:00', heureFin: '13:00', dureeCreneau: 30 },
  { id: 'p4', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', jour: 'VENDREDI', heureDebut: '09:00', heureFin: '12:00', dureeCreneau: 30 },
  { id: 'p5', medecinId: 'm2', medecinNom: 'Dr. Amadou Ba', jour: 'MARDI', heureDebut: '08:00', heureFin: '12:00', dureeCreneau: 45 },
  { id: 'p6', medecinId: 'm2', medecinNom: 'Dr. Amadou Ba', jour: 'JEUDI', heureDebut: '09:00', heureFin: '13:00', dureeCreneau: 45 },
  { id: 'p7', medecinId: 'm3', medecinNom: 'Dr. Ibrahima Diop', jour: 'LUNDI', heureDebut: '08:30', heureFin: '12:30', dureeCreneau: 20 },
  { id: 'p8', medecinId: 'm3', medecinNom: 'Dr. Ibrahima Diop', jour: 'MERCREDI', heureDebut: '14:00', heureFin: '18:00', dureeCreneau: 20 },
];
