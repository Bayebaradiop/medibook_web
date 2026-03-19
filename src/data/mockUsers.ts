import type { UserRole, EntityStatus } from '@/utils/constants';

export interface User {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  role: UserRole;
  statut: EntityStatus;
  specialiteId?: string;
  specialite?: string;
  cabinetId?: string;
  cabinet?: string;
  photo?: string;
}

export const mockMedecins: User[] = [
  { id: 'm1', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@medibook.sn', telephone: '+221 77 111 11 11', role: 'MEDECIN', statut: 'ACTIF', specialiteId: 's1', specialite: 'Médecine Générale', cabinetId: 'c1', cabinet: 'Cabinet Médical Medibook' },
  { id: 'm2', prenom: 'Amadou', nom: 'Ba', email: 'amadou.ba@medibook.sn', telephone: '+221 77 222 22 22', role: 'MEDECIN', statut: 'ACTIF', specialiteId: 's2', specialite: 'Cardiologie', cabinetId: 'c1', cabinet: 'Cabinet Médical Medibook' },
  { id: 'm3', prenom: 'Ibrahima', nom: 'Diop', email: 'ibrahima.diop@cabinetsud.sn', telephone: '+221 77 333 33 33', role: 'MEDECIN', statut: 'ACTIF', specialiteId: 's6', specialite: 'Ophtalmologie', cabinetId: 'c2', cabinet: 'Cabinet Médical Sud' },
  { id: 'm4', prenom: 'Fatou', nom: 'Niang', email: 'fatou.niang@medibook.sn', telephone: '+221 77 444 44 44', role: 'MEDECIN', statut: 'INACTIF', specialiteId: 's3', specialite: 'Pédiatrie', cabinetId: 'c1', cabinet: 'Cabinet Médical Medibook' },
  { id: 'm5', prenom: 'Cheikh', nom: 'Tall', email: 'cheikh.tall@cabinetsud.sn', telephone: '+221 77 555 55 55', role: 'MEDECIN', statut: 'ACTIF', specialiteId: 's4', specialite: 'Dermatologie', cabinetId: 'c2', cabinet: 'Cabinet Médical Sud' },
];

export const mockSecretaires: User[] = [
  { id: 'sec1', prenom: 'Marie', nom: 'Sarr', email: 'marie.sarr@medibook.sn', telephone: '+221 77 666 66 66', role: 'SECRETAIRE', statut: 'ACTIF', specialiteId: 's1', specialite: 'Médecine Générale', cabinetId: 'c1', cabinet: 'Cabinet Médical Medibook' },
  { id: 'sec2', prenom: 'Aissatou', nom: 'Fall', email: 'aissatou.fall@cabinetsud.sn', telephone: '+221 77 777 77 77', role: 'SECRETAIRE', statut: 'ACTIF', specialiteId: 's6', specialite: 'Ophtalmologie', cabinetId: 'c2', cabinet: 'Cabinet Médical Sud' },
  { id: 'sec3', prenom: 'Ndèye', nom: 'Gueye', email: 'ndeye.gueye@medibook.sn', telephone: '+221 77 888 88 88', role: 'SECRETAIRE', statut: 'INACTIF', specialiteId: 's2', specialite: 'Cardiologie', cabinetId: 'c1', cabinet: 'Cabinet Médical Medibook' },
];

export const mockCurrentUser: Record<UserRole, User> = {
  SUPER_ADMIN: { id: 'sa1', prenom: 'Admin', nom: 'Système', email: 'superadmin@medibook.sn', telephone: '+221 77 000 00 00', role: 'SUPER_ADMIN', statut: 'ACTIF' },
  ADMIN: { id: 'a1', prenom: 'Ousmane', nom: 'Diallo', email: 'admin@medibook.sn', telephone: '+221 77 100 00 01', role: 'ADMIN', statut: 'ACTIF', cabinetId: 'c1', cabinet: 'Cabinet Médical Medibook' },
  MEDECIN: { id: 'm1', prenom: 'Jean', nom: 'Dupont', email: 'medecin@medibook.sn', telephone: '+221 77 111 11 11', role: 'MEDECIN', statut: 'ACTIF', specialiteId: 's1', specialite: 'Médecine Générale', cabinetId: 'c1', cabinet: 'Cabinet Médical Medibook' },
  SECRETAIRE: { id: 'sec1', prenom: 'Marie', nom: 'Sarr', email: 'secretaire@medibook.sn', telephone: '+221 77 666 66 66', role: 'SECRETAIRE', statut: 'ACTIF', specialiteId: 's1', specialite: 'Médecine Générale', cabinetId: 'c1', cabinet: 'Cabinet Médical Medibook' },
};
