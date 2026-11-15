// Regras puras do laudo de ultrassom (testáveis sem DOM).

export const parseMeasure = (v) => {
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const fold = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function findReference(refs, patient, organ, parameter) {
  const species = patient?.species;
  const list = (refs || []).filter((r) =>
    r.species === species && fold(r.organ) === fold(organ) && fold(r.parameter || r.measurement_type) === fold(parameter)
  );
  return list.find((r) => r.size && r.size === patient?.size) || list.find((r) => !r.size) || list[0] || null;
}

export function evaluateMeasurement(value, ref) {
  const n = parseMeasure(value);
  if (n === null || !ref) return null;
  const min = parseMeasure(ref.min_value);
  const max = parseMeasure(ref.max_value);
  if (min !== null && n < min) return 'low';
  if (max !== null && n > max) return 'high';
  return 'normal';
}

export const formatRange = (ref) => {
  if (!ref) return '';
  const min = parseMeasure(ref.min_value);
  const max = parseMeasure(ref.max_value);
  const u = ref.unit || 'cm';
  if (!min && max !== null) return `até ${max} ${u}`;
  return `${min ?? '?'}–${max ?? '?'} ${u}`;
};

// Substitui {M1}/{MEDIDA1} pelo valor + unidade; medidas vazias ficam com `missing`.
export function fillPlaceholders(text, measurements, missing = '___') {
  if (!text) return '';
  return text.replace(/\{(?:MEDIDA|M)([1-3])\}/gi, (_, n) => {
    const m = measurements?.[`m${n}`];
    return m && String(m.value).trim() ? `${m.value} ${m.unit || 'cm'}` : missing;
  });
}

// Mescla roteiro padrão com dados salvos, sem nunca descartar órgãos salvos fora do roteiro.
export function mergeOrgans(structures, saved = []) {
  const blank = (label) => ({ organ_name: label, measurements: {}, report_text: '', visual_data: null });
  const merged = structures.map((s) => saved.find((o) => o.organ_name === s.label) || blank(s.label));
  const extras = saved.filter((o) => !structures.some((s) => s.label === o.organ_name));
  return [...merged, ...extras];
}

// Insere texto guia na posição do cursor (ou substitui tudo).
export function applyTemplateText(current, snippet, { mode = 'insert', cursor } = {}) {
  if (mode === 'replace' || !current) return { text: snippet, cursor: snippet.length };
  const pos = Number.isInteger(cursor) ? Math.min(Math.max(cursor, 0), current.length) : current.length;
  const before = current.slice(0, pos);
  const after = current.slice(pos);
  const sepBefore = before && !before.endsWith('\n') ? '\n' : '';
  const sepAfter = after && !after.startsWith('\n') ? '\n' : '';
  const text = `${before}${sepBefore}${snippet}${sepAfter}${after}`;
  return { text, cursor: (before + sepBefore + snippet).length };
}

// Órgãos cujo texto cita {M1..M3} sem valor preenchido.
export function findMissingMeasures(organs) {
  return organs.filter((o) => (o.report_text || '').match(/\{(?:MEDIDA|M)[1-3]\}/gi)?.some((r) => {
    const n = r.match(/[1-3]/)[0];
    return !String(o.measurements?.[`m${n}`]?.value || '').trim();
  })).map((o) => o.organ_name);
}
