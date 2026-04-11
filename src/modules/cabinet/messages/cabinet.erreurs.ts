export const CABINET_ERREURS = {
  // Cabinet - champs obligatoires
  NOM_REQUIS: "Le nom du cabinet est obligatoire",
  NOM_TROP_LONG: "Le nom ne peut pas dépasser 255 caractères",
  ADRESSE_REQUISE: "L'adresse est obligatoire",
  ADRESSE_TROP_LONGUE: "L'adresse ne peut pas dépasser 500 caractères",
  TELEPHONE_REQUIS: "Le téléphone du cabinet est obligatoire",
  TELEPHONE_FORMAT_INVALIDE: "Format de téléphone invalide. Ex: +221 33 123 45 67",
  EMAIL_REQUIS: "L'email du cabinet est obligatoire",
  EMAIL_INVALIDE: "Format d'email invalide pour le cabinet",
  COULEUR_FORMAT_INVALIDE: "La couleur doit être au format hexadécimal (#RRGGBB)",

  // Cabinet - doublons
  NOM_DEJA_EXISTANT: "Un cabinet avec ce nom existe déjà",
  EMAIL_DEJA_UTILISE: "Cet email est déjà utilisé par un autre cabinet",

  // Admin - champs obligatoires
  ADMIN_NOM_REQUIS: "Le nom de l'administrateur est obligatoire",
  ADMIN_PRENOM_REQUIS: "Le prénom de l'administrateur est obligatoire",
  ADMIN_EMAIL_REQUIS: "L'email de l'administrateur est obligatoire",
  ADMIN_EMAIL_INVALIDE: "Format d'email invalide pour l'administrateur",
  ADMIN_TELEPHONE_REQUIS: "Le téléphone de l'administrateur est obligatoire",
  ADMIN_TELEPHONE_FORMAT_INVALIDE: "Format de téléphone invalide pour l'administrateur. Ex: +221 77 123 45 67",
  ADMIN_PASSWORD_REQUIS: "Le mot de passe de l'administrateur est obligatoire",
  ADMIN_PASSWORD_TROP_COURT: "Le mot de passe doit contenir au moins 6 caractères",

  // Admin - doublons
  ADMIN_EMAIL_DEJA_UTILISE: "L'email de l'administrateur est déjà utilisé",
  ADMIN_TELEPHONE_DEJA_UTILISE: "Le téléphone de l'administrateur est déjà utilisé",

  // Opérations
  CREATION_ECHOUEE: "Erreur lors de la création du cabinet",
  MODIFICATION_ECHOUEE: "Erreur lors de la modification du cabinet",
  SUPPRESSION_ECHOUEE: "Erreur lors de la suppression du cabinet",
  CHARGEMENT_ECHOUE: "Erreur lors du chargement des cabinets",
  CABINET_NON_TROUVE: "Cabinet introuvable",
};
