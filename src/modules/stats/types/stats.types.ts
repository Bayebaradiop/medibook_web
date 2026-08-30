export interface StatsSuperAdmin {
  totalCabinets: number;
  totalMedecins: number;
  totalSecretaires: number;
  totalPatients: number;
  totalRdv: number;
  rdvEnAttente: number;
  rdvConfirmes: number;
  rdvTermines: number;
  rdvAnnules: number;
}

export interface StatsAdmin {
  cabinetNom?: string;
  totalMedecins: number;
  totalSecretaires: number;
  totalPatients: number;
  totalRdv: number;
  rdvEnAttente: number;
  rdvConfirmes: number;
  rdvTermines: number;
  rdvAnnules: number;
}

export interface StatsMedecin {
  totalRdv: number;
  totalPatients: number;
  rdvEnAttente: number;
  rdvConfirmes: number;
  rdvTermines: number;
  rdvAnnules: number;
  rdvAujourdhui?: number;
}

export interface StatsSecretaire {
  cabinetNom?: string;
  totalMedecins: number;
  totalPatients: number;
  totalRdv: number;
  rdvEnAttente: number;
  rdvConfirmes: number;
  rdvTermines: number;
  rdvAnnules: number;
}
