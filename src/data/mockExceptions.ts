export interface PlanningException {
  id: string;
  medecinId: string;
  medecinNom: string;
  date: string;
  type: 'ABSENT';
  heureDebut?: string;
  heureFin?: string;
  motif: string;
  journeeComplete: boolean;
}

export const mockExceptions: PlanningException[] = [
  { id: 'ex1', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', date: '2026-03-25', type: 'ABSENT', motif: 'Congrès médical à Paris', journeeComplete: true },
  { id: 'ex2', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', date: '2026-03-26', type: 'ABSENT', motif: 'Congrès médical à Paris', journeeComplete: true },
  { id: 'ex3', medecinId: 'm2', medecinNom: 'Dr. Amadou Ba', date: '2026-03-20', type: 'ABSENT', heureDebut: '08:00', heureFin: '12:00', motif: 'Rendez-vous personnel', journeeComplete: false },
  { id: 'ex4', medecinId: 'm3', medecinNom: 'Dr. Ibrahima Diop', date: '2026-04-01', type: 'ABSENT', motif: 'Congé annuel', journeeComplete: true },
  { id: 'ex5', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', date: '2026-04-10', type: 'ABSENT', heureDebut: '14:00', heureFin: '17:00', motif: 'Formation continue', journeeComplete: false },
];
