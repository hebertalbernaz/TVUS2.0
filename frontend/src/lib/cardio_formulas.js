/**
 * TVUSVET V2.0 - Fórmulas de Cardiologia
 * Ecocardiograma (Teichholz, FS%, EF%, LA:Ao, Massa VE)
 * Eletrocardiograma (Referências VET/HUMAN)
 */

// ─── ECOCARDIOGRAMA ───

/** Volume pelo Método de Teichholz (ml) */
export function calculateTeichholzVolume(dimension) {
  const d = parseFloat(dimension);
  if (!d || d <= 0) return null;
  return (7.0 / (2.4 + d)) * Math.pow(d, 3);
}

/** Fração de Encurtamento FS% */
export function calculateFS(lvidd, lvids) {
  const dd = parseFloat(lvidd);
  const ds = parseFloat(lvids);
  if (!dd || dd <= 0) return null;
  if (isNaN(ds)) return null;
  return ((dd - ds) / dd) * 100;
}

/** Fração de Ejeção EF% (a partir dos volumes) */
export function calculateEF(edv, esv) {
  const e = parseFloat(edv);
  const s = parseFloat(esv);
  if (!e || e <= 0) return null;
  if (isNaN(s)) return null;
  return ((e - s) / e) * 100;
}

/** Relação Átrio Esquerdo / Aorta */
export function calculateLAAoRatio(la, ao) {
  const l = parseFloat(la);
  const a = parseFloat(ao);
  if (!a || a <= 0 || !l || l <= 0) return null;
  return l / a;
}

/** Massa do VE (ASE) em gramas */
export function calculateLVMass(sivd, lvidd, ppved) {
  const s = parseFloat(sivd);
  const d = parseFloat(lvidd);
  const p = parseFloat(ppved);
  if (!s || !d || !p || s <= 0 || d <= 0 || p <= 0) return null;
  return 0.8 * (1.04 * (Math.pow(s + d + p, 3) - Math.pow(d, 3))) + 0.6;
}

/**
 * Calcula todos os parâmetros ecocardiográficos de uma vez.
 * Recebe um objeto com as medidas brutas (sivd, dived, ppve, sivs, dives, ppves, ae, ao).
 * Retorna um objeto com resultados calculados.
 */
export function calculateAllEcho(m) {
  const val = (k) => { const v = parseFloat(m?.[k]); return isNaN(v) ? 0 : v; };

  const lvidd = val('dived');
  const lvids = val('dives');
  const la = val('ae');
  const ao = val('ao');
  const sivd = val('sivd');
  const ppve = val('ppve');

  const edv = calculateTeichholzVolume(lvidd);
  const esv = calculateTeichholzVolume(lvids);
  const fs = calculateFS(lvidd, lvids);
  const ef = (edv && esv !== null) ? calculateEF(edv, esv) : null;
  const laaо = calculateLAAoRatio(la, ao);
  const lvMass = calculateLVMass(sivd, lvidd, ppve);

  return {
    fs: fs !== null ? fs.toFixed(1) : null,
    ef: ef !== null ? ef.toFixed(1) : null,
    edv: edv !== null ? edv.toFixed(1) : null,
    esv: esv !== null ? esv.toFixed(1) : null,
    la_ao: laaо !== null ? laaо.toFixed(2) : null,
    lv_mass: lvMass !== null ? lvMass.toFixed(1) : null,
  };
}

// ─── REFERÊNCIAS ECHO ───
export const ECHO_REFERENCE = {
  vet: {
    fs: { label: 'FS%', normal: '25 – 45', unit: '%' },
    ef: { label: 'FE%', normal: '50 – 75', unit: '%' },
    la_ao: { label: 'AE/Ao', normal: '< 1.6 (cão) / < 1.5 (gato)', unit: '' },
  },
  human: {
    fs: { label: 'FS%', normal: '25 – 45', unit: '%' },
    ef: { label: 'FE%', normal: '55 – 70', unit: '%' },
    la_ao: { label: 'AE/Ao', normal: '< 1.3', unit: '' },
  },
};

// ─── VÁLVULAS ───
export const VALVE_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'insuf_leve', label: 'Insuficiência Leve' },
  { value: 'insuf_mod', label: 'Insuficiência Moderada' },
  { value: 'insuf_grave', label: 'Insuficiência Grave' },
  { value: 'estenose_leve', label: 'Estenose Leve' },
  { value: 'estenose_mod', label: 'Estenose Moderada' },
  { value: 'estenose_grave', label: 'Estenose Grave' },
  { value: 'prolapso', label: 'Prolapso' },
  { value: 'espessamento', label: 'Espessamento' },
];

export const VALVES = [
  { id: 'mitral', label: 'Mitral' },
  { id: 'tricuspide', label: 'Tricúspide' },
  { id: 'aortica', label: 'Aórtica' },
  { id: 'pulmonar', label: 'Pulmonar' },
];

// ─── ELETROCARDIOGRAMA ───

export const ECG_RHYTHMS = [
  { value: 'sinusal', label: 'Ritmo Sinusal Normal' },
  { value: 'arritmia_sinusal', label: 'Arritmia Sinusal' },
  { value: 'taquicardia_sinusal', label: 'Taquicardia Sinusal' },
  { value: 'bradicardia_sinusal', label: 'Bradicardia Sinusal' },
  { value: 'fa', label: 'Fibrilação Atrial (FA)' },
  { value: 'flutter_atrial', label: 'Flutter Atrial' },
  { value: 'cvp', label: 'Complexos Ventriculares Prematuros (CVP)' },
  { value: 'tv', label: 'Taquicardia Ventricular (TV)' },
  { value: 'fv', label: 'Fibrilação Ventricular (FV)' },
  { value: 'bav1', label: 'Bloqueio AV 1º Grau' },
  { value: 'bav2', label: 'Bloqueio AV 2º Grau' },
  { value: 'bav3', label: 'Bloqueio AV 3º Grau (Total)' },
  { value: 'brd', label: 'Bloqueio de Ramo Direito' },
  { value: 'bre', label: 'Bloqueio de Ramo Esquerdo' },
  { value: 'marca_passo', label: 'Ritmo de Marca-Passo' },
];

/** Valores de referência ECG por prática */
export const ECG_REFERENCE = {
  vet: {
    hr: { label: 'FC', normal: '60 – 180 (cão) / 120 – 240 (gato)', unit: 'bpm', placeholder: '120' },
    p_duration: { label: 'Duração P', normal: '< 0.04s (cão)', unit: 's', placeholder: '0.04' },
    p_amplitude: { label: 'Amplitude P', normal: '< 0.4mV (cão)', unit: 'mV', placeholder: '0.3' },
    pr_interval: { label: 'Intervalo PR', normal: '0.06 – 0.14s', unit: 's', placeholder: '0.10' },
    qrs_duration: { label: 'Duração QRS', normal: '< 0.06s (cão)', unit: 's', placeholder: '0.05' },
    qt_interval: { label: 'Intervalo QT', normal: '0.15 – 0.25s', unit: 's', placeholder: '0.20' },
    mea: { label: 'Eixo Médio (MEA)', normal: '+40° a +100° (cão)', unit: '°', placeholder: '70' },
  },
  human: {
    hr: { label: 'FC', normal: '60 – 100', unit: 'bpm', placeholder: '75' },
    p_duration: { label: 'Duração P', normal: '< 0.12s', unit: 's', placeholder: '0.10' },
    p_amplitude: { label: 'Amplitude P', normal: '< 0.25mV', unit: 'mV', placeholder: '0.15' },
    pr_interval: { label: 'Intervalo PR', normal: '0.12 – 0.20s', unit: 's', placeholder: '0.16' },
    qrs_duration: { label: 'Duração QRS', normal: '< 0.12s', unit: 's', placeholder: '0.08' },
    qt_interval: { label: 'Intervalo QT', normal: '0.35 – 0.44s', unit: 's', placeholder: '0.40' },
    mea: { label: 'Eixo Médio (MEA)', normal: '-30° a +90°', unit: '°', placeholder: '60' },
  },
};

// ─── ECHO NORMAL TEMPLATE ───
export const ECHO_NORMAL_TEMPLATE = {
  vet: {
    findings: "Ecocardiograma bidimensional e modo M dentro dos limites da normalidade para a espécie e porte.\n\nVentrículo esquerdo com dimensões diastólica e sistólica preservadas. Função sistólica do ventrículo esquerdo normal (FS e FE dentro dos valores de referência). Septo interventricular e parede livre do ventrículo esquerdo com espessura normal. Ventrículo direito sem dilatação. Átrio esquerdo com dimensões normais (relação AE/Ao dentro dos limites). Átrio direito sem alterações evidentes.\n\nVálvulas mitral, tricúspide, aórtica e pulmonar com morfologia e movimentação normais. Fluxos transvalvulares dentro da normalidade ao Doppler. Sem regurgitações significativas detectadas.\n\nPericárdio de aspecto habitual. Ausência de efusão pericárdica.",
    conclusion: "Ecocardiograma dentro dos limites da normalidade.",
  },
  human: {
    findings: "Ecocardiograma transtorácico bidimensional com Doppler colorido.\n\nVentrículo esquerdo com dimensões cavitárias normais e função sistólica global preservada (FE dentro dos valores de referência pelo método de Teichholz). Espessura do septo interventricular e da parede posterior do VE normais. Sem alterações da contratilidade segmentar.\n\nVentrículo direito com dimensões e função preservadas. Átrio esquerdo com dimensões normais. Átrio direito sem dilatação.\n\nVálvula mitral com folhetos delgados e de mobilidade normal. Válvula aórtica trivalvulada, com abertura adequada. Válvulas tricúspide e pulmonar sem alterações morfológicas significativas. Fluxos transvalvulares normais ao Doppler. Sem regurgitações patológicas.\n\nPericárdio de aspecto normal.",
    conclusion: "Ecocardiograma transtorácico dentro dos padrões da normalidade.",
  },
};

// ─── ECG NORMAL TEMPLATE ───
export const ECG_NORMAL_TEMPLATE = {
  vet: {
    interpretation: "Eletrocardiograma realizado em derivações bipolares (I, II, III) e unipolares (aVR, aVL, aVF).\n\nRitmo sinusal normal. Frequência cardíaca dentro dos limites da normalidade para a espécie e porte. Onda P com morfologia, duração e amplitude normais. Intervalo PR regular e dentro dos valores de referência. Complexo QRS com duração e morfologia normais. Eixo elétrico médio (MEA) dentro dos limites da normalidade. Segmento ST sem desnivelamentos significativos. Onda T sem alterações. Intervalo QT dentro dos valores de referência.\n\nAusência de arritmias, bloqueios ou alterações sugestivas de sobrecarga.",
    conclusion: "Eletrocardiograma dentro dos limites da normalidade.",
  },
  human: {
    interpretation: "Eletrocardiograma de 12 derivações.\n\nRitmo sinusal regular. Frequência cardíaca dentro dos limites da normalidade. Onda P sinusal, com duração e voltagem normais em todas as derivações. Intervalo PR regular e dentro dos limites. Complexo QRS com duração normal, sem padrões de bloqueio de ramo. Eixo elétrico do QRS normal. Progressão normal de R nas derivações precordiais (V1-V6). Segmento ST isoelétrico. Onda T positiva em derivações fisiológicas. Intervalo QT/QTc dentro dos valores de referência.\n\nAusência de arritmias, bloqueios, sobrecargas ou isquemia.",
    conclusion: "Eletrocardiograma dentro dos padrões da normalidade.",
  },
};

// ─── Gera relatório automático ECHO baseado nos cálculos ───
export function generateEchoAutoReport(measurements, calculated, valves, practice) {
  const parts = [];

  // Função sistólica
  const fs = parseFloat(calculated.fs);
  if (!isNaN(fs)) {
    if (fs < 25) parts.push("Função sistólica do ventrículo esquerdo gravemente reduzida.");
    else if (fs < 28) parts.push("Função sistólica do ventrículo esquerdo reduzida.");
    else parts.push("Função sistólica do ventrículo esquerdo preservada.");
  }

  // EF
  const ef = parseFloat(calculated.ef);
  if (!isNaN(ef)) {
    const minEf = practice === 'human' ? 55 : 50;
    if (ef < minEf) parts.push(`Fração de ejeção reduzida (${calculated.ef}%).`);
  }

  // LA:Ao
  const ratio = parseFloat(calculated.la_ao);
  if (!isNaN(ratio)) {
    const limit = practice === 'human' ? 1.3 : 1.6;
    if (ratio > limit) parts.push(`Aumento do átrio esquerdo (AE/Ao: ${calculated.la_ao}).`);
    else parts.push("Átrio esquerdo com dimensões preservadas.");
  }

  // Válvulas
  if (valves) {
    const abnormal = Object.entries(valves).filter(([, v]) => v && v !== 'normal');
    if (abnormal.length > 0) {
      abnormal.forEach(([key, val]) => {
        const vName = VALVES.find(v => v.id === key)?.label || key;
        const vLabel = VALVE_OPTIONS.find(o => o.value === val)?.label || val;
        parts.push(`Válvula ${vName}: ${vLabel}.`);
      });
    }
  }

  return parts.join(" ");
}
