/**
 * TVUSVET V2.0 - Dicionário de Termos (Veterinária)
 */
export const VET_SPECIES = [
  { value: 'dog', label: 'Canina' },
  { value: 'cat', label: 'Felina' },
  { value: 'equine', label: 'Equina' },
  { value: 'bovine', label: 'Bovina' },
  { value: 'ovine', label: 'Ovina' },
  { value: 'caprine', label: 'Caprina' },
  { value: 'swine', label: 'Suína' },
  { value: 'bird', label: 'Ave' },
  { value: 'rodent', label: 'Roedor' },
  { value: 'lagomorph', label: 'Lagomorfo (Coelho)' },
  { value: 'reptile', label: 'Réptil' },
  { value: 'other', label: 'Outra' },
];

export const getSpeciesLabel = (species) => {
  if (species === 'human') return 'Humano';
  return VET_SPECIES.find((s) => s.value === species)?.label || species || '-';
};

export const vetTerms = {
    patient_label: "Paciente", // Nome do animal
    owner_label: "Tutor",
    id_label: "RGA/Microchip",
    birth_date_label: "Nascimento",
    age_label: "Idade",
    weight_label: "Peso (kg)",
    species_label: "Espécie",
    breed_label: "Raça",
    sex_label: "Sexo",
    sex_male: "Macho",
    sex_female: "Fêmea",
    doctor_label: "Veterinário Solicitante",
    crm_label: "CRMV",
    species_options: VET_SPECIES,

    // Module Specific
    prescription_header: "Receituário Veterinário",
    lab_title: "Patologia Clínica Veterinária",
    cardio_title: "Cardiologia Veterinária",
  };
