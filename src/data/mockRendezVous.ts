import type { AppointmentStatus } from '@/utils/constants';

export interface RendezVous {
  id: string;
  date: string;
  heure: string;
  patientNom: string;
  patientTelephone: string;
  patientEmail: string;
  medecinId: string;
  medecinNom: string;
  specialite: string;
  motif: string;
  statut: AppointmentStatus;
  cabinetId: string;
}

export const mockRendezVous: RendezVous[] = [
  { id: 'rv1', date: '2026-03-18', heure: '09:00', patientNom: 'Fatou Sall', patientTelephone: '+221 78 100 00 01', patientEmail: 'fatou@email.com', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', specialite: 'Médecine Générale', motif: 'Consultation générale', statut: 'EN_ATTENTE', cabinetId: 'c1' },
  { id: 'rv2', date: '2026-03-18', heure: '09:30', patientNom: 'Aliou Diallo', patientTelephone: '+221 78 200 00 02', patientEmail: 'aliou@email.com', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', specialite: 'Médecine Générale', motif: 'Renouvellement ordonnance', statut: 'CONFIRME', cabinetId: 'c1' },
  { id: 'rv3', date: '2026-03-18', heure: '10:00', patientNom: 'Moussa Diagne', patientTelephone: '+221 78 300 00 03', patientEmail: 'moussa@email.com', medecinId: 'm2', medecinNom: 'Dr. Amadou Ba', specialite: 'Cardiologie', motif: 'Bilan cardiaque', statut: 'CONFIRME', cabinetId: 'c1' },
  { id: 'rv4', date: '2026-03-17', heure: '14:00', patientNom: 'Awa Mbaye', patientTelephone: '+221 78 400 00 04', patientEmail: 'awa@email.com', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', specialite: 'Médecine Générale', motif: 'Suivi tension artérielle', statut: 'TERMINE', cabinetId: 'c1' },
  { id: 'rv5', date: '2026-03-17', heure: '15:00', patientNom: 'Ibou Ndiaye', patientTelephone: '+221 78 500 00 05', patientEmail: 'ibou@email.com', medecinId: 'm2', medecinNom: 'Dr. Amadou Ba', specialite: 'Cardiologie', motif: 'ECG de contrôle', statut: 'TERMINE', cabinetId: 'c1' },
  { id: 'rv6', date: '2026-03-16', heure: '11:00', patientNom: 'Mariama Sy', patientTelephone: '+221 78 600 00 06', patientEmail: 'mariama@email.com', medecinId: 'm3', medecinNom: 'Dr. Ibrahima Diop', specialite: 'Ophtalmologie', motif: 'Examen de vue', statut: 'ANNULE', cabinetId: 'c2' },
  { id: 'rv7', date: '2026-03-19', heure: '08:30', patientNom: 'Oumar Fall', patientTelephone: '+221 78 700 00 07', patientEmail: 'oumar@email.com', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', specialite: 'Médecine Générale', motif: 'Vaccination', statut: 'EN_ATTENTE', cabinetId: 'c1' },
  { id: 'rv8', date: '2026-03-19', heure: '10:30', patientNom: 'Khady Diop', patientTelephone: '+221 78 800 00 08', patientEmail: 'khady@email.com', medecinId: 'm2', medecinNom: 'Dr. Amadou Ba', specialite: 'Cardiologie', motif: 'Consultation hypertension', statut: 'EN_ATTENTE', cabinetId: 'c1' },
  { id: 'rv9', date: '2026-03-15', heure: '09:00', patientNom: 'Pape Seck', patientTelephone: '+221 78 900 00 09', patientEmail: 'pape@email.com', medecinId: 'm3', medecinNom: 'Dr. Ibrahima Diop', specialite: 'Ophtalmologie', motif: 'Fond d\'œil', statut: 'TERMINE', cabinetId: 'c2' },
  { id: 'rv10', date: '2026-03-20', heure: '11:00', patientNom: 'Dieynaba Ba', patientTelephone: '+221 78 100 10 10', patientEmail: 'dieynaba@email.com', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', specialite: 'Médecine Générale', motif: 'Douleurs abdominales', statut: 'EN_ATTENTE', cabinetId: 'c1' },
  { id: 'rv11', date: '2026-03-14', heure: '16:00', patientNom: 'Seydou Camara', patientTelephone: '+221 78 110 11 11', patientEmail: 'seydou@email.com', medecinId: 'm2', medecinNom: 'Dr. Amadou Ba', specialite: 'Cardiologie', motif: 'Douleur thoracique', statut: 'TERMINE', cabinetId: 'c1' },
  { id: 'rv12', date: '2026-03-13', heure: '09:30', patientNom: 'Rokhaya Faye', patientTelephone: '+221 78 120 12 12', patientEmail: 'rokhaya@email.com', medecinId: 'm1', medecinNom: 'Dr. Jean Dupont', specialite: 'Médecine Générale', motif: 'Certificat médical', statut: 'ANNULE', cabinetId: 'c1' },
];
