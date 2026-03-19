export interface Specialite {
  id: string;
  nom: string;
  description: string;
  nbMedecins: number;
}

export const mockSpecialites: Specialite[] = [
  { id: 's1', nom: 'Médecine Générale', description: 'Consultations médicales générales et suivi des patients', nbMedecins: 3 },
  { id: 's2', nom: 'Cardiologie', description: 'Diagnostic et traitement des maladies cardiovasculaires', nbMedecins: 2 },
  { id: 's3', nom: 'Pédiatrie', description: 'Soins médicaux pour les enfants et adolescents', nbMedecins: 1 },
  { id: 's4', nom: 'Dermatologie', description: 'Traitement des maladies de la peau', nbMedecins: 1 },
  { id: 's5', nom: 'Gynécologie', description: 'Santé reproductive et suivi gynécologique', nbMedecins: 1 },
  { id: 's6', nom: 'Ophtalmologie', description: 'Soins des yeux et correction visuelle', nbMedecins: 2 },
];
