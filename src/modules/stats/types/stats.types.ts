export interface StatsSuperAdmin {
  totalCabinets: number;
  cabinetsActifs: number;
  cabinetsInactifs: number;
}

export interface StatsAdmin {
  totalMedecins: number;
  totalSecretaires: number;
  totalPatients: number;
  totalRdv: number;
  rdvAujourdhui: number;
}

export interface StatsMedecin {
  totalRdv: number;
  rdvAujourdhui: number;
  rdvEnAttente: number;
  rdvConfirmes: number;
  rdvTermines: number;
}
