export interface Cabinet {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  statut: 'ACTIF' | 'INACTIF';
  couleurPrimaire: string;
  couleurSecondaire: string;
  logo?: string;
  admin: { prenom: string; nom: string; email: string; telephone: string };
  dateCreation: string;
}

export const mockCabinets: Cabinet[] = [
  {
    id: 'c1', nom: 'Cabinet Médical Medibook', adresse: 'Rue 12, Dakar Plateau', telephone: '+221 33 821 00 00',
    email: 'contact@medibook.sn', statut: 'ACTIF', couleurPrimaire: '#2E7D32', couleurSecondaire: '#66BB6A',
    admin: { prenom: 'Ousmane', nom: 'Diallo', email: 'ousmane@medibook.sn', telephone: '+221 77 100 00 01' },
    dateCreation: '2024-01-15',
  },
  {
    id: 'c2', nom: 'Cabinet Médical Sud', adresse: 'Avenue Cheikh Anta Diop, Dakar Fann', telephone: '+221 33 825 00 00',
    email: 'contact@cabinetsud.sn', statut: 'ACTIF', couleurPrimaire: '#1565C0', couleurSecondaire: '#42A5F5',
    admin: { prenom: 'Aminata', nom: 'Ndiaye', email: 'aminata@cabinetsud.sn', telephone: '+221 77 200 00 02' },
    dateCreation: '2024-03-20',
  },
  {
    id: 'c3', nom: 'Clinique Santé Plus', adresse: 'Route de Rufisque, Pikine', telephone: '+221 33 830 00 00',
    email: 'info@santeplus.sn', statut: 'INACTIF', couleurPrimaire: '#E65100', couleurSecondaire: '#FF9800',
    admin: { prenom: 'Moussa', nom: 'Sow', email: 'moussa@santeplus.sn', telephone: '+221 77 300 00 03' },
    dateCreation: '2024-06-10',
  },
];
