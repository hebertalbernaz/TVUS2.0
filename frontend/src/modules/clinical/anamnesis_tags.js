export const ANAMNESIS_TAGS = {
  chief_complaint: [
    { label: 'Vômito', text: 'Presença de episódios eméticos. ' },
    { label: 'Diarreia', text: 'Quadro de diarreia. ' },
    { label: 'Apatia', text: 'Paciente apresenta apatia. ' },
    { label: 'Inapetência', text: 'Diminuição do apetite. ' },
    { label: 'Tosse', text: 'Episódios de tosse. ' },
    { label: 'Dispneia', text: 'Dificuldade respiratória. ' },
    { label: 'Prurido', text: 'Prurido intenso. ' },
    { label: 'Claudicação', text: 'Claudicação de membro. ' },
    { label: 'Convulsão', text: 'Episódio convulsivo. ' },
    { label: 'Trauma', text: 'História de trauma. ' },
    { label: 'Prostração', text: 'Paciente prostrado. ' },
    { label: 'Emagrecimento', text: 'Perda de peso progressiva. ' }
  ],

  digestive: [
    { label: 'Vômito', text: 'Vômitos frequentes. ' },
    { label: 'Regurgitação', text: 'Regurgitação pós-prandial. ' },
    { label: 'Diarreia', text: 'Fezes diarreicas. ' },
    { label: 'Melena', text: 'Presença de melena (sangue digerido). ' },
    { label: 'Hematoquezia', text: 'Sangue vivo nas fezes. ' },
    { label: 'Constipação', text: 'Dificuldade para defecar. ' },
    { label: 'Tenesmo', text: 'Tenesmo fecal. ' },
    { label: 'Flatulência', text: 'Flatulência excessiva. ' },
    { label: 'Distensão', text: 'Distensão abdominal. ' },
    { label: 'Icterícia', text: 'Mucosas ictéricas. ' },
    { label: 'Normal', text: 'Sistema digestório sem alterações relatadas. ' }
  ],

  cardio_resp: [
    { label: 'Tosse', text: 'Tosse produtiva/improdutiva. ' },
    { label: 'Dispneia', text: 'Dispneia ao esforço/repouso. ' },
    { label: 'Cianose', text: 'Cianose de mucosas. ' },
    { label: 'Intolerância', text: 'Intolerância ao exercício. ' },
    { label: 'Síncope', text: 'Episódios de síncope. ' },
    { label: 'Taquipneia', text: 'Aumento da frequência respiratória. ' },
    { label: 'Espirros', text: 'Espirros frequentes. ' },
    { label: 'Secreção nasal', text: 'Presença de secreção nasal. ' },
    { label: 'Edema', text: 'Edema de membros. ' },
    { label: 'Ascite', text: 'Distensão abdominal por líquido. ' },
    { label: 'Normal', text: 'Sistema cardiorrespiratório sem alterações. ' }
  ],

  genitourinary: [
    { label: 'Poliúria', text: 'Aumento do volume urinário. ' },
    { label: 'Polidipsia', text: 'Aumento da ingestão hídrica. ' },
    { label: 'Disúria', text: 'Dificuldade/dor ao urinar. ' },
    { label: 'Hematúria', text: 'Presença de sangue na urina. ' },
    { label: 'Incontinência', text: 'Incontinência urinária. ' },
    { label: 'Anúria', text: 'Ausência de produção urinária. ' },
    { label: 'Secreção vulvar', text: 'Presença de secreção vulvar. ' },
    { label: 'Secreção prepucial', text: 'Secreção prepucial. ' },
    { label: 'Criptorquidismo', text: 'Testículo não descido. ' },
    { label: 'Pseudociese', text: 'Pseudogestação. ' },
    { label: 'Normal', text: 'Sistema genitourinário sem alterações. ' }
  ],

  neuro_locomotor: [
    { label: 'Convulsão', text: 'Episódios convulsivos. ' },
    { label: 'Ataxia', text: 'Incoordenação motora. ' },
    { label: 'Paresia', text: 'Fraqueza muscular. ' },
    { label: 'Paralisia', text: 'Perda de função motora. ' },
    { label: 'Head tilt', text: 'Inclinação da cabeça. ' },
    { label: 'Nistagmo', text: 'Movimentos oculares involuntários. ' },
    { label: 'Claudicação', text: 'Manqueira. ' },
    { label: 'Dor cervical', text: 'Dor na região cervical. ' },
    { label: 'Dor lombar', text: 'Dor na região lombar. ' },
    { label: 'Tremores', text: 'Tremores musculares. ' },
    { label: 'Rigidez', text: 'Rigidez muscular. ' },
    { label: 'Normal', text: 'Sistema neurológico e locomotor sem alterações. ' }
  ],

  tegumentary: [
    { label: 'Prurido', text: 'Prurido intenso. ' },
    { label: 'Alopecia', text: 'Áreas de alopecia. ' },
    { label: 'Descamação', text: 'Descamação cutânea. ' },
    { label: 'Eritema', text: 'Eritema cutâneo. ' },
    { label: 'Pústulas', text: 'Presença de pústulas. ' },
    { label: 'Crostas', text: 'Formação de crostas. ' },
    { label: 'Nódulos', text: 'Nódulos cutâneos. ' },
    { label: 'Feridas', text: 'Lesões/feridas abertas. ' },
    { label: 'Otite', text: 'Sinais de otite. ' },
    { label: 'Pulgas', text: 'Presença de ectoparasitas (pulgas). ' },
    { label: 'Carrapatos', text: 'Presença de carrapatos. ' },
    { label: 'Normal', text: 'Tegumento sem alterações visíveis. ' }
  ],

  eyes_ears: [
    { label: 'Secreção ocular', text: 'Presença de secreção ocular. ' },
    { label: 'Hiperemia', text: 'Hiperemia conjuntival. ' },
    { label: 'Opacidade', text: 'Opacidade corneana/lenticular. ' },
    { label: 'Blefaroespasmo', text: 'Blefaroespasmo. ' },
    { label: 'Prurido ocular', text: 'Prurido periocular. ' },
    { label: 'Secreção auricular', text: 'Secreção no conduto auditivo. ' },
    { label: 'Prurido auricular', text: 'Prurido auricular intenso. ' },
    { label: 'Head shaking', text: 'Sacudir frequente da cabeça. ' },
    { label: 'Dor auricular', text: 'Dor à manipulação auricular. ' },
    { label: 'Normal', text: 'Olhos e ouvidos sem alterações. ' }
  ],

  lymphatic: [
    { label: 'Linfadenopatia', text: 'Linfonodos aumentados. ' },
    { label: 'Submand. aumentado', text: 'Linfonodos submandibulares aumentados. ' },
    { label: 'Poplíteo aumentado', text: 'Linfonodos poplíteos aumentados. ' },
    { label: 'Generalizada', text: 'Linfadenopatia generalizada. ' },
    { label: 'Normal', text: 'Linfonodos sem alterações palpáveis. ' }
  ],

  feeding: [
    { label: 'Ração Premium', text: 'Alimentação: ração premium. ' },
    { label: 'Ração Standard', text: 'Alimentação: ração standard. ' },
    { label: 'Comida caseira', text: 'Alimentação: comida caseira. ' },
    { label: 'Mista', text: 'Alimentação mista (ração + caseira). ' },
    { label: 'Natural/BARF', text: 'Alimentação natural (BARF/AN). ' }
  ],

  appetite: [
    { label: 'Normal', text: 'Apetite preservado. ' },
    { label: 'Aumentado', text: 'Polifagia. ' },
    { label: 'Diminuído', text: 'Hiporexia. ' },
    { label: 'Ausente', text: 'Anorexia. ' },
    { label: 'Seletivo', text: 'Apetite seletivo. ' }
  ],

  vaccine_status: [
    { label: 'Atualizado', text: 'Vacinação em dia. ' },
    { label: 'Atrasado', text: 'Vacinação atrasada. ' },
    { label: 'Nunca vacinou', text: 'Nunca foi vacinado. ' },
    { label: 'Protocolo incompleto', text: 'Protocolo vacinal incompleto. ' },
    { label: 'Desconhecido', text: 'Histórico vacinal desconhecido. ' }
  ],

  environment: [
    { label: 'Domiciliado', text: 'Animal domiciliado. ' },
    { label: 'Acesso à rua', text: 'Com acesso à rua. ' },
    { label: 'Quintal', text: 'Vive em quintal. ' },
    { label: 'Apartamento', text: 'Vive em apartamento. ' },
    { label: 'Sítio/Fazenda', text: 'Ambiente rural. ' }
  ],

  hydration: [
    { label: 'Normal', text: 'Normo-hidratado. ' },
    { label: 'Leve (3-5%)', text: 'Desidratação leve (3-5%). ' },
    { label: 'Moderada (6-8%)', text: 'Desidratação moderada (6-8%). ' },
    { label: 'Grave (>8%)', text: 'Desidratação grave (>8%). ' }
  ],

  mucous: [
    { label: 'Róseas', text: 'Mucosas normocoradas (róseas). ' },
    { label: 'Pálidas', text: 'Mucosas hipocoradas (pálidas). ' },
    { label: 'Hiperêmicas', text: 'Mucosas hiperêmicas. ' },
    { label: 'Ictéricas', text: 'Mucosas ictéricas. ' },
    { label: 'Cianóticas', text: 'Mucosas cianóticas. ' },
    { label: 'Congestas', text: 'Mucosas congestas. ' }
  ],

  general_state: [
    { label: 'Alerta', text: 'Paciente alerta e responsivo. ' },
    { label: 'Ativo', text: 'Animal ativo. ' },
    { label: 'Apático', text: 'Paciente apático. ' },
    { label: 'Prostrado', text: 'Animal prostrado. ' },
    { label: 'Agressivo', text: 'Comportamento agressivo. ' },
    { label: 'Agitado', text: 'Animal agitado. ' },
    { label: 'Deprimido', text: 'Estado mental deprimido. ' }
  ],

  diagnosis_common: [
    { label: 'Gastroenterite', text: 'Gastroenterite' },
    { label: 'Erliquiose', text: 'Erliquiose canina' },
    { label: 'Babesiose', text: 'Babesiose' },
    { label: 'Piometra', text: 'Piometra' },
    { label: 'TVT', text: 'Tumor venéreo transmissível' },
    { label: 'Parvovirose', text: 'Parvovirose canina' },
    { label: 'Cinomose', text: 'Cinomose' },
    { label: 'Dermatite alérgica', text: 'Dermatite alérgica' },
    { label: 'Otite externa', text: 'Otite externa' },
    { label: 'DTUIF', text: 'Doença do trato urinário inferior felino' },
    { label: 'IRC', text: 'Insuficiência renal crônica' },
    { label: 'Cardiopatia', text: 'Cardiopatia' },
    { label: 'Diabetes', text: 'Diabetes mellitus' },
    { label: 'Hepatopatia', text: 'Hepatopatia' },
    { label: 'Neoplasia', text: 'Neoplasia (investigar)' }
  ]
};

export const SYSTEM_ICONS = {
  digestive: 'Utensils',
  cardio_resp: 'Heart',
  genitourinary: 'Droplets',
  neuro_locomotor: 'Brain',
  tegumentary: 'Brush',
  eyes_ears: 'Eye',
  lymphatic: 'Activity'
};

export const TAB_CONFIG = [
  { id: 'complaint', label: 'Queixa', icon: 'MessageCircle' },
  { id: 'history', label: 'HMA', icon: 'FileText' },
  { id: 'physiological', label: 'Fisiológico', icon: 'Clipboard' },
  { id: 'systems', label: 'Sistêmico', icon: 'Stethoscope' },
  { id: 'physical', label: 'Exame Físico', icon: 'Activity' },
  { id: 'diagnosis', label: 'Diagnóstico', icon: 'CheckCircle' }
];
