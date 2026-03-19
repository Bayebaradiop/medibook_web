export interface Creneau {
  id: string;
  medecinId: string;
  medecinNom: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  disponible: boolean;
}

export const mockCreneaux: Creneau[] = [
  { id: 'cr1', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', date: '2026-03-18', heureDebut: '08:00', heureFin: '08:30', disponible: false },
  { id: 'cr2', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', date: '2026-03-18', heureDebut: '08:30', heureFin: '09:00', disponible: false },
  { id: 'cr3', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', date: '2026-03-18', heureDebut: '09:00', heureFin: '09:30', disponible: false },
  { id: 'cr4', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', date: '2026-03-18', heureDebut: '09:30', heureFin: '10:00', disponible: true },
  { id: 'cr5', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', date: '2026-03-18', heureDebut: '10:00', heureFin: '10:30', disponible: true },
  { id: 'cr6', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', date: '2026-03-18', heureDebut: '10:30', heureFin: '11:00', disponible: true },
  { id: 'cr7', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', date: '2026-03-18', heureDebut: '11:00', heureFin: '11:30', disponible: true },
  { id: 'cr8', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', date: '2026-03-18', heureDebut: '11:30', heureFin: '12:00', disponible: true },
  { id: 'cr9', medecinId: 'm2', medecinNom: 'Dr. Amadou Ba', date: '2026-03-18', heureDebut: '08:00', heureFin: '08:45', disponible: false },
  { id: 'cr10', medecinId: 'm2', medecinNom: 'Dr. Amadou Ba', date: '2026-03-18', heureDebut: '08:45', heureFin: '09:30', disponible: true },
  { id: 'cr11', medecinId: 'm2', medecinNom: 'Dr. Amadou Ba', date: '2026-03-18', heureDebut: '09:30', heureFin: '10:15', disponible: true },
  { id: 'cr12', medecinId: 'm2', medecinNom: 'Dr. Amadou Ba', date: '2026-03-18', heureDebut: '10:15', heureFin: '11:00', disponible: false },
  { id: 'cr13', medecinId: 'm3', medecinNom: 'Dr. Ibrahima Diop', date: '2026-03-19', heureDebut: '08:30', heureFin: '08:50', disponible: true },
  { id: 'cr14', medecinId: 'm3', medecinNom: 'Dr. Ibrahima Diop', date: '2026-03-19', heureDebut: '08:50', heureFin: '09:10', disponible: true },
];
