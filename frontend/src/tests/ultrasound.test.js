/** @jest-environment node */

import { localDb, getLocalDb, seedBuiltins } from '../core/database/localDb';
import { ULTRASOUND_TEMPLATES, ULTRASOUND_REFERENCE_VALUES, getOrganMeasurements } from '../config/ultrasound_templates';
import { getStructuresForExam } from '../lib/exam_types';
import { fillPlaceholders, findReference, evaluateMeasurement, mergeOrgans, applyTemplateText, formatRange, findMissingMeasures } from '../lib/ultrasound';

const roteiro = [
  ...getStructuresForExam('ultrasound_abd', { sex: 'male' }),
  ...getStructuresForExam('ultrasound_abd', { sex: 'female' })
].map((s) => s.label);

describe('textos guia do ultrassom', () => {
  test('todo órgão do roteiro tem Aspecto Normal e ao menos uma Alteração Comum', () => {
    for (const organ of new Set(roteiro)) {
      const list = ULTRASOUND_TEMPLATES.filter((t) => t.organ === organ);
      expect({ organ, normal: list.some((t) => t.category === 'normal') }).toEqual({ organ, normal: true });
      expect({ organ, alt: list.some((t) => t.category === 'alteracao') }).toEqual({ organ, alt: true });
    }
  });

  test('ids únicos e placeholders só dentro de M1..M3 definidos para o órgão', () => {
    const ids = ULTRASOUND_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of ULTRASOUND_TEMPLATES) {
      const used = (t.text.match(/\{M([1-3])\}/g) || []).map((m) => `m${m[2]}`);
      const defs = getOrganMeasurements(t.organ).filter((d) => !d.generic).map((d) => d.key);
      used.forEach((k) => expect({ id: t.id, k, ok: defs.includes(k) }).toEqual({ id: t.id, k, ok: true }));
      expect(t.text).not.toMatch(/\{(?!M[1-3]\})/);
    }
  });

  test('cobre os achados pedidos: cistite, urolitíase, nefropatia, pielectasia, esteatose, lama, esplenomegalia, corpo estranho, HPB, piometra, efusão', () => {
    const titles = ULTRASOUND_TEMPLATES.map((t) => `${t.organ}:${t.title}`).join('|');
    ['Vesícula Urinária:Cistite', 'Vesícula Urinária:Sedimento', 'Vesícula Urinária:Urolitíase', 'Rins:Nefropatia crônica', 'Rim Esquerdo:Pielectasia',
      'Fígado:Hepatomegalia', 'Fígado:Esteatose', 'Vesícula Biliar:Lama biliar', 'Baço:Esplenomegalia', 'Baço:Nódulos esplênicos',
      'Estômago:Gastrite', 'Estômago:Corpo estranho', 'Duodeno:Enterite', 'Próstata:Hiperplasia prostática benigna', 'Útero:Piometra',
      'Cavidade Peritoneal:Efusão'].forEach((needle) => expect(titles).toContain(needle));
  });
});

describe('medidas, placeholders e referências', () => {
  test('fillPlaceholders aceita {M1}/{MEDIDA1} e marca medida vazia', () => {
    const txt = 'Parede {M1}; urólito {MEDIDA2}; outro {M3}.';
    expect(fillPlaceholders(txt, { m1: { value: '0.3', unit: 'cm' }, m2: { value: '1,2', unit: 'cm' } }))
      .toBe('Parede 0.3 cm; urólito 1,2 cm; outro ___.');
  });

  test('alerta acima/abaixo da referência da espécie (vírgula decimal)', () => {
    const cat = { species: 'cat' };
    const ref = findReference(ULTRASOUND_REFERENCE_VALUES, cat, 'Vesícula Urinária', 'Espessura de parede');
    expect(formatRange(ref)).toBe('0.13–0.17 cm');
    expect(evaluateMeasurement('0,4', ref)).toBe('high');
    expect(evaluateMeasurement('0.1', ref)).toBe('low');
    expect(evaluateMeasurement('0.15', ref)).toBe('normal');
    expect(evaluateMeasurement('', ref)).toBeNull();
    expect(findReference(ULTRASOUND_REFERENCE_VALUES, { species: 'equine' }, 'Vesícula Urinária', 'Espessura de parede')).toBeNull();
  });

  test('findMissingMeasures aponta órgãos com {M} sem valor', () => {
    expect(findMissingMeasures([
      { organ_name: 'Baço', report_text: 'Espessura {M1}', measurements: {} },
      { organ_name: 'Fígado', report_text: 'Normal', measurements: {} },
      { organ_name: 'Pâncreas', report_text: '{M1}', measurements: { m1: { value: '0.5' } } }
    ])).toEqual(['Baço']);
  });
});

describe('edição do laudo', () => {
  test('inserir texto guia no cursor e substituir', () => {
    const r = applyTemplateText('Linha A\nLinha B', 'NOVO', { cursor: 7 });
    expect(r.text).toBe('Linha A\nNOVO\nLinha B');
    expect(r.text.slice(0, r.cursor)).toBe('Linha A\nNOVO');
    expect(applyTemplateText('qualquer', 'X', { mode: 'replace' }).text).toBe('X');
    expect(applyTemplateText('', 'X').text).toBe('X');
  });

  test('mergeOrgans nunca descarta órgãos salvos fora do roteiro atual', () => {
    const merged = mergeOrgans([{ label: 'Fígado' }, { label: 'Baço' }], [
      { organ_name: 'Baço', report_text: 'b' },
      { organ_name: 'Órgão Antigo', report_text: 'legado' }
    ]);
    expect(merged.map((o) => o.organ_name)).toEqual(['Fígado', 'Baço', 'Órgão Antigo']);
    expect(merged[1].report_text).toBe('b');
  });
});

describe('seed dos textos guia no IndexedDB', () => {
  test('registra todos os textos e referências uma vez, sem sobrescrever edições do usuário', async () => {
    await getLocalDb();
    const sample = ULTRASOUND_TEMPLATES[0];
    expect((await localDb.templates.get(sample.id)).text).toBe(sample.text);
    expect(await localDb.reference_values.get(ULTRASOUND_REFERENCE_VALUES[0].id)).toBeTruthy();

    await localDb.templates.update(sample.id, { text: 'editado pelo vet' });
    await localDb.templates.delete(ULTRASOUND_TEMPLATES[1].id);
    await seedBuiltins();
    expect((await localDb.templates.get(sample.id)).text).toBe('editado pelo vet');
    expect(await localDb.templates.get(ULTRASOUND_TEMPLATES[1].id)).toBeUndefined();

    const vetTemplates = await localDb.templates.where('organ').equals('Vesícula Urinária').toArray();
    expect(vetTemplates.length).toBeGreaterThanOrEqual(6);
  });
});
