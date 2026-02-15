/**
 * TVUSVET V2.0 - Dicionário de Termos para Diagnóstico por Imagem
 * Regiões, Projeções e Templates de Laudo Normal
 * Separados por prática: VET (Veterinária) e HUMAN (Medicina Humana)
 */

// ─── REGIÕES ANATÔMICAS ───
export const RADIOLOGY_REGIONS = {
  vet: [
    { value: 'torax', label: 'Tórax' },
    { value: 'abdome', label: 'Abdome' },
    { value: 'cranio', label: 'Crânio' },
    { value: 'coluna_cervical', label: 'Coluna Cervical' },
    { value: 'coluna_toracolombar', label: 'Coluna Toracolombar' },
    { value: 'membro_toracico', label: 'Membro Torácico' },
    { value: 'membro_pelvico', label: 'Membro Pélvico' },
    { value: 'pelve', label: 'Pelve / Articulação Coxofemoral' },
  ],
  human: [
    { value: 'torax', label: 'Tórax' },
    { value: 'abdome', label: 'Abdome' },
    { value: 'cranio', label: 'Crânio' },
    { value: 'coluna_cervical', label: 'Coluna Cervical' },
    { value: 'coluna_toracolombar', label: 'Coluna Toracolombar' },
    { value: 'coluna_lombossacra', label: 'Coluna Lombossacra' },
    { value: 'membro_superior', label: 'Membro Superior' },
    { value: 'membro_inferior', label: 'Membro Inferior' },
    { value: 'pelve', label: 'Pelve / Bacia' },
    { value: 'seios_face', label: 'Seios da Face' },
  ],
};

// ─── PROJEÇÕES RADIOGRÁFICAS ───
export const RADIOLOGY_PROJECTIONS = {
  vet: [
    { value: 'LL', label: 'Latero-Lateral (LL)' },
    { value: 'VD', label: 'Ventro-Dorsal (VD)' },
    { value: 'DV', label: 'Dorso-Ventral (DV)' },
    { value: 'CrCd', label: 'Crânio-Caudal (CrCd)' },
    { value: 'CdCr', label: 'Caudo-Cranial (CdCr)' },
    { value: 'ML', label: 'Médio-Lateral (ML)' },
    { value: 'obliqua', label: 'Oblíqua' },
  ],
  human: [
    { value: 'PA', label: 'Póstero-Anterior (PA)' },
    { value: 'AP', label: 'Ântero-Posterior (AP)' },
    { value: 'perfil', label: 'Perfil (Lateral)' },
    { value: 'obliqua', label: 'Oblíqua' },
    { value: 'incidencia_lordotica', label: 'Incidência Lordótica' },
    { value: 'decubito', label: 'Decúbito Lateral' },
  ],
};

// ─── REGIÕES DE TOMOGRAFIA ───
export const CT_REGIONS = {
  vet: [
    { value: 'cranio', label: 'Crânio / Encéfalo' },
    { value: 'coluna_cervical', label: 'Coluna Cervical' },
    { value: 'coluna_toracolombar', label: 'Coluna Toracolombar' },
    { value: 'torax', label: 'Tórax' },
    { value: 'abdomen_total', label: 'Abdome Total' },
    { value: 'articular', label: 'Articular / Membros' },
    { value: 'body_scan', label: 'Body Scan (Corpo Inteiro)' },
  ],
  human: [
    { value: 'cranio', label: 'Crânio / Encéfalo' },
    { value: 'coluna_cervical', label: 'Coluna Cervical' },
    { value: 'coluna_toracolombar', label: 'Coluna Toracolombar' },
    { value: 'coluna_lombossacra', label: 'Coluna Lombossacra' },
    { value: 'torax', label: 'Tórax' },
    { value: 'abdomen_total', label: 'Abdome Total' },
    { value: 'abdomen_pelve', label: 'Abdome e Pelve' },
    { value: 'articular', label: 'Articular / Membros' },
    { value: 'angio_tc', label: 'Angio-TC' },
  ],
};

// ─── OPÇÕES DE CONTRASTE (CT) ───
export const CT_CONTRAST_OPTIONS = [
  { value: 'sem_contraste', label: 'Sem Contraste' },
  { value: 'fase_arterial', label: 'Fase Arterial' },
  { value: 'fase_venosa', label: 'Fase Venosa / Portal' },
  { value: 'multifasico', label: 'Multifásico' },
  { value: 'tardia', label: 'Fase Tardia / Excretora' },
];

// ─── TEMPLATES DE LAUDO NORMAL - RADIOLOGIA ───
export const RADIOLOGY_NORMAL_TEMPLATES = {
  vet: {
    torax: {
      findings: "Campos pulmonares com radiotransparência preservada, sem evidência de padrões pulmonares patológicos (alveolar, bronquial ou intersticial). Silhueta cardíaca com dimensões, formato e topografia dentro dos limites da normalidade para a espécie e porte. Traqueia cervical e torácica com lúmen e trajeto conservados. Mediastino cranial sem alterações. Estruturas ósseas visibilizadas (costelas, esterno, vértebras torácicas) com radiopacidade e contornos preservados. Espaço pleural sem sinais de efusão. Diafragma com posição e contorno normais.",
      conclusion: "Estudo radiográfico torácico dentro dos limites da normalidade.",
    },
    abdome: {
      findings: "Serosa peritoneal com detalhamento preservado. Silhueta hepática com dimensões e radiopacidade normais, sem ultrapassar o arco costal. Silhueta esplênica com dimensões habituais. Rins com dimensões, formato e topografia normais, com relação córtico-medular preservada. Vesícula urinária parcialmente repleta, de contornos regulares. Alças intestinais com distribuição gasosa habitual, sem sinais de dilatação segmentar ou corpos estranhos radiopacos. Estruturas ósseas (coluna lombar, pelve) sem alterações.",
      conclusion: "Estudo radiográfico abdominal dentro dos limites da normalidade.",
    },
    cranio: {
      findings: "Calota craniana com radiopacidade e contornos ósseos preservados. Bulas timpânicas simétricas, com conteúdo gasoso normal e paredes íntegras. Articulações temporomandibulares congruentes. Cavidade nasal com turbinados visibilizados e de aspecto habitual. Seios frontais (quando presentes) sem opacificação. Dentes visibilizados sem alterações evidentes.",
      conclusion: "Estudo radiográfico craniano dentro dos limites da normalidade.",
    },
    coluna_cervical: {
      findings: "Corpos vertebrais cervicais com alinhamento, formato e radiopacidade preservados. Espaços intervertebrais com amplitude regular e simétrica. Processos articulares sem sinais de remodelamento. Forames intervertebrais sem evidência de compressão. Tecidos moles perivertebrais sem alterações.",
      conclusion: "Estudo radiográfico da coluna cervical dentro dos limites da normalidade.",
    },
    coluna_toracolombar: {
      findings: "Corpos vertebrais toracolombares com alinhamento, formato e radiopacidade preservados. Espaços intervertebrais com amplitude regular. Processos espinhosos e transversos sem alterações. Ausência de sinais de espondilose deformante, fraturas ou luxações. Forames intervertebrais sem evidência de redução.",
      conclusion: "Estudo radiográfico da coluna toracolombar dentro dos limites da normalidade.",
    },
    membro_toracico: {
      findings: "Estruturas ósseas do membro torácico com radiopacidade, cortical e trabeculado preservados. Superfícies articulares congruentes e lisas. Espaços articulares com amplitude regular. Ausência de sinais de fraturas, reações periosteais ou lesões líticas/proliferativas. Tecidos moles adjacentes sem alterações.",
      conclusion: "Estudo radiográfico do membro torácico dentro dos limites da normalidade.",
    },
    membro_pelvico: {
      findings: "Estruturas ósseas do membro pélvico com radiopacidade, cortical e trabeculado preservados. Superfícies articulares congruentes e lisas. Espaços articulares com amplitude regular. Ausência de sinais de fraturas, reações periosteais ou lesões líticas/proliferativas. Tecidos moles adjacentes sem alterações.",
      conclusion: "Estudo radiográfico do membro pélvico dentro dos limites da normalidade.",
    },
    pelve: {
      findings: "Ossos pélvicos (ílio, ísquio, púbis) com radiopacidade e contornos preservados. Articulações coxofemorais com congruência articular e cobertura acetabular adequadas. Cabeças femorais arredondadas, de contornos lisos e regulares. Espaço articular coxofemoral com amplitude preservada. Ausência de sinais de displasia, subluxação, fraturas ou osteoartrose.",
      conclusion: "Estudo radiográfico pélvico dentro dos limites da normalidade.",
    },
  },
  human: {
    torax: {
      findings: "Campos pulmonares com transparência preservada, sem opacidades parenquimatosas focais ou difusas. Seios costofrênicos livres. Silhueta cardíaca com dimensões e morfologia normais, índice cardiotorácico dentro dos limites da normalidade. Mediastino centrado, sem alargamento. Hilo pulmonares de aspecto habitual. Traqueia centrada, de calibre normal. Arcabouço ósseo sem lesões. Partes moles sem alterações.",
      conclusion: "Radiografia de tórax dentro dos padrões da normalidade.",
    },
    abdome: {
      findings: "Distribuição gasosa intestinal de aspecto habitual, sem sinais de distensão significativa ou níveis hidroaéreos patológicos. Silhueta hepática de dimensões normais. Sombras renais tópicas e de dimensões habituais. Ausência de calcificações patológicas projetadas sobre o trajeto ureteral ou região vesical. Arcabouço ósseo sem alterações. Partes moles sem alterações evidentes.",
      conclusion: "Radiografia de abdome dentro dos padrões da normalidade.",
    },
    cranio: {
      findings: "Calota craniana com espessura e densidade normais. Suturas cranianas sem diástase. Sela túrcica de dimensões e morfologia normais. Seios paranasais pneumatizados. Mastoide com aeração preservada. Estruturas ósseas da face sem alterações.",
      conclusion: "Radiografia de crânio dentro dos padrões da normalidade.",
    },
    coluna_cervical: {
      findings: "Corpos vertebrais cervicais com alinhamento e altura preservados. Lordose cervical fisiológica mantida. Espaços discais com amplitude preservada. Processos unciformes sem hipertrofia significativa. Forames de conjugação amplos. Tecidos moles pré-vertebrais sem espessamento.",
      conclusion: "Radiografia da coluna cervical dentro dos padrões da normalidade.",
    },
    coluna_toracolombar: {
      findings: "Corpos vertebrais toracolombares com alinhamento e altura preservados. Cifose torácica e lordose lombar fisiológicas mantidas. Espaços discais com amplitude preservada. Pedículos vertebrais simétricos. Ausência de sinais de espondilolistese, fraturas ou lesões líticas.",
      conclusion: "Radiografia da coluna toracolombar dentro dos padrões da normalidade.",
    },
    coluna_lombossacra: {
      findings: "Corpos vertebrais lombossacros com alinhamento e altura preservados. Lordose lombar fisiológica mantida. Espaços discais com amplitude preservada. Articulações sacroilíacas simétricas. Ausência de sinais de espondilolistese ou estenose.",
      conclusion: "Radiografia da coluna lombossacra dentro dos padrões da normalidade.",
    },
    membro_superior: {
      findings: "Estruturas ósseas do membro superior com cortical, medular e trabeculado de aspecto normal. Superfícies articulares congruentes. Espaços articulares preservados. Ausência de sinais de fraturas, luxações ou lesões ósseas focais. Partes moles sem alterações.",
      conclusion: "Radiografia do membro superior dentro dos padrões da normalidade.",
    },
    membro_inferior: {
      findings: "Estruturas ósseas do membro inferior com cortical, medular e trabeculado de aspecto normal. Superfícies articulares congruentes. Espaços articulares preservados. Ausência de sinais de fraturas, luxações ou lesões ósseas focais. Partes moles sem alterações.",
      conclusion: "Radiografia do membro inferior dentro dos padrões da normalidade.",
    },
    pelve: {
      findings: "Ossos do quadril com radiopacidade e contornos preservados. Articulações sacroilíacas simétricas. Articulações coxofemorais com congruência articular mantida. Espaço articular coxofemoral de amplitude normal. Ausência de sinais de fraturas ou lesões líticas. Sínfise púbica de aspecto habitual.",
      conclusion: "Radiografia da pelve dentro dos padrões da normalidade.",
    },
    seios_face: {
      findings: "Seios paranasais (maxilares, frontais, etmoidais e esfenoidais) com pneumatização preservada. Ausência de opacificação ou espessamento mucoso significativo. Septo nasal centrado. Cornetos nasais de aspecto habitual. Arcabouço ósseo facial sem lesões.",
      conclusion: "Radiografia dos seios da face dentro dos padrões da normalidade.",
    },
  },
};

// ─── TEMPLATES DE LAUDO NORMAL - TOMOGRAFIA ───
export const CT_NORMAL_TEMPLATES = {
  vet: {
    cranio: {
      findings: "Parênquima encefálico com coeficientes de atenuação preservados, sem evidência de lesões expansivas, hemorrágicas ou isquêmicas. Sistema ventricular com dimensões e simetria normais. Cisterna magna sem alterações. Bulas timpânicas com conteúdo gasoso habitual e paredes íntegras. Estruturas ósseas da calota craniana sem alterações. Órbitas de aspecto normal. Cavidade nasal com turbinados preservados.",
      conclusion: "Estudo tomográfico craniano dentro dos limites da normalidade.",
    },
    coluna_cervical: {
      findings: "Corpos vertebrais cervicais com alinhamento, morfologia e coeficientes de atenuação preservados. Canal vertebral com amplitude normal. Disco intervertebrais sem sinais de protrusão ou extrusão. Medula espinhal com sinal homogêneo. Forames intervertebrais amplos. Musculatura paravertebral sem alterações.",
      conclusion: "Estudo tomográfico da coluna cervical dentro dos limites da normalidade.",
    },
    coluna_toracolombar: {
      findings: "Corpos vertebrais toracolombares com alinhamento e atenuação preservados. Canal vertebral com amplitude regular. Discos intervertebrais sem sinais de mineralização, protrusão ou extrusão de material discal. Espaço epidural sem acúmulo de material de atenuação anômala. Processos articulares sem remodelamento significativo.",
      conclusion: "Estudo tomográfico da coluna toracolombar dentro dos limites da normalidade.",
    },
    torax: {
      findings: "Parênquima pulmonar com coeficientes de atenuação preservados, sem opacidades nodulares, massas ou consolidações. Via aérea principal e brônquios principais pervios. Silhueta cardíaca de dimensões normais. Grandes vasos sem dilatações. Mediastino sem linfadenopatia. Espaço pleural livre. Parede torácica e estruturas ósseas sem alterações.",
      conclusion: "Estudo tomográfico torácico dentro dos limites da normalidade.",
    },
    abdomen_total: {
      findings: "Fígado com dimensões, contornos e coeficientes de atenuação preservados. Vesícula biliar com conteúdo homogêneo. Baço com dimensões habituais. Pâncreas com morfologia e atenuação normais. Rins com dimensões, contornos e relação córtico-medular preservados. Adrenais com morfologia normal. Vesícula urinária parcialmente repleta, de paredes finas. Alças intestinais sem distensão ou espessamento parietal significativo. Linfonodos abdominais sem aumento. Ausência de líquido livre na cavidade peritoneal.",
      conclusion: "Estudo tomográfico abdominal dentro dos limites da normalidade.",
    },
    articular: {
      findings: "Superfícies articulares com contornos regulares e congruentes. Espaço articular com amplitude preservada. Osso subcondral com atenuação normal. Ausência de fragmentos osteocondrais, corpos livres ou reação periosteal. Tecidos moles periarticulares sem alterações significativas.",
      conclusion: "Estudo tomográfico articular dentro dos limites da normalidade.",
    },
    body_scan: {
      findings: "Estudo de corpo inteiro realizado. Parênquima pulmonar sem opacidades focais. Silhueta cardíaca normal. Mediastino sem alterações. Fígado, baço, rins e adrenais com dimensões e atenuação preservados. Vesícula urinária normal. Linfonodos sem aumento significativo. Estruturas ósseas sem lesões líticas ou blásticas evidentes.",
      conclusion: "Estudo tomográfico de corpo inteiro (body scan) dentro dos limites da normalidade.",
    },
  },
  human: {
    cranio: {
      findings: "Parênquima encefálico com coeficientes de atenuação normais para as substâncias branca e cinzenta. Diferenciação córtico-subcortical preservada. Sistema ventricular com dimensões e morfologia normais, simétrico. Cisternas basais pérvias. Estruturas da linha mediana centradas. Sela túrcica de aspecto normal. Estruturas ósseas da calota e base do crânio sem alterações. Órbitas, mastoide e seios paranasais de aspecto habitual.",
      conclusion: "Tomografia computadorizada de crânio dentro dos padrões da normalidade.",
    },
    coluna_cervical: {
      findings: "Corpos vertebrais cervicais com alinhamento, morfologia e atenuação preservados. Canal vertebral com amplitude normal. Discos intervertebrais sem sinais de protrusão ou herniação. Forames neurais amplos. Articulações uncovertebrais e facetárias sem alterações degenerativas significativas. Tecidos moles pré e paravertebrais sem espessamento.",
      conclusion: "Tomografia computadorizada da coluna cervical dentro dos padrões da normalidade.",
    },
    coluna_toracolombar: {
      findings: "Corpos vertebrais toracolombares com alinhamento, altura e atenuação preservados. Canal vertebral com calibre normal. Discos intervertebrais sem protrusões ou herniações significativas. Articulações facetárias sem alterações degenerativas importantes. Ligamentos amarelos sem espessamento.",
      conclusion: "Tomografia computadorizada da coluna toracolombar dentro dos padrões da normalidade.",
    },
    coluna_lombossacra: {
      findings: "Corpos vertebrais lombossacros com alinhamento, altura e atenuação preservados. Lordose lombar fisiológica mantida. Canal vertebral com calibre normal em todos os níveis estudados. Discos intervertebrais sem protrusões ou herniações significativas. Recessos laterais e forames neurais amplos. Articulações facetárias e sacroilíacas sem alterações degenerativas significativas.",
      conclusion: "Tomografia computadorizada da coluna lombossacra dentro dos padrões da normalidade.",
    },
    torax: {
      findings: "Parênquima pulmonar com coeficientes de atenuação preservados, sem opacidades parenquimatosas, nódulos ou massas. Árvore brônquica com calibre e paredes normais. Traqueia e brônquios principais pérvios. Mediastino com estruturas vasculares de calibre normal. Aorta sem dilatações ou calcificações significativas. Linfonodos mediastinais de dimensões normais. Coração de dimensões normais. Espaço pleural livre bilateralmente. Estruturas ósseas sem lesões.",
      conclusion: "Tomografia computadorizada de tórax dentro dos padrões da normalidade.",
    },
    abdomen_total: {
      findings: "Fígado com dimensões, contornos e coeficientes de atenuação homogêneos. Vesícula biliar com conteúdo homogêneo, sem cálculos. Vias biliares intra e extra-hepáticas de calibre normal. Pâncreas com morfologia e atenuação preservados. Baço com dimensões habituais. Rins com dimensões, contornos e realce normais. Sistema pielocalicinal não dilatado. Adrenais com morfologia e dimensões normais. Aorta abdominal e vasos de calibre normal. Linfonodos retroperitoneais de dimensões normais. Ausência de líquido livre.",
      conclusion: "Tomografia computadorizada de abdome dentro dos padrões da normalidade.",
    },
    abdomen_pelve: {
      findings: "Fígado, baço, pâncreas e rins com dimensões, contornos e atenuação preservados. Adrenais sem alterações. Aorta e vasos ilíacos de calibre normal. Linfonodos de dimensões normais. Bexiga urinária repleta, de paredes finas e regulares. Útero/próstata de dimensões e morfologia habituais. Reto e alças intestinais pélvicas sem espessamento parietal. Ausência de líquido livre ou coleções. Estruturas ósseas da pelve sem lesões.",
      conclusion: "Tomografia computadorizada de abdome e pelve dentro dos padrões da normalidade.",
    },
    articular: {
      findings: "Superfícies articulares com contornos regulares e congruentes. Espaço articular com amplitude preservada. Osso subcondral com atenuação normal. Ausência de corpos livres intra-articulares, erosões ou osteófitos significativos. Partes moles periarticulares sem alterações.",
      conclusion: "Tomografia computadorizada articular dentro dos padrões da normalidade.",
    },
    angio_tc: {
      findings: "Aorta e seus ramos principais com calibre, contornos e opacificação normais. Ausência de dilatações aneurismáticas, estenoses ou dissecções. Artérias renais, mesentéricas e ilíacas de calibre e trajeto normais. Veias visualizadas sem sinais de trombose.",
      conclusion: "Angio-TC dentro dos padrões da normalidade.",
    },
  },
};

// ─── ESCALA HOUNSFIELD (Referência) ───
export const HU_SCALE = [
  { label: 'Ar (-1000)', min: -1000, max: -900, color: 'text-blue-300' },
  { label: 'Pulmão (-500)', min: -600, max: -400, color: 'text-blue-400' },
  { label: 'Gordura (-100)', min: -120, max: -50, color: 'text-yellow-500' },
  { label: 'Água (0)', min: -10, max: 10, color: 'text-cyan-500' },
  { label: 'Tecidos Moles (40)', min: 20, max: 80, color: 'text-red-400' },
  { label: 'Sangue (60-90)', min: 50, max: 90, color: 'text-red-700' },
  { label: 'Osso (> 700)', min: 700, max: 3000, color: 'text-slate-500' },
];

// Helper: Classificar valor HU
export function classifyHU(val) {
  const v = parseFloat(val);
  if (isNaN(v)) return '';
  const match = HU_SCALE.find(s => v >= s.min && v <= s.max);
  return match ? match.label.split(' (')[0] : 'Inespecífico';
}
