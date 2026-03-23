export interface StatsSuperAdmin {
  totalCabinets: number;
  cabinetsActifs: number;
  cabinetsInactifs: number;
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
  rdvAujourdhui: number;
  rdvEnAttente: number;
  rdvConfirmes: number;
  rdvTermines: number;
}
