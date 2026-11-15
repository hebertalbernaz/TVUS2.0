/** @jest-environment node */

import { localDb, getLocalDb, getMediaDataUrl } from '../core/database/localDb';
import { db } from '../services/database';

beforeAll(async () => {
  await getLocalDb();
});

describe('db.getPatientTimeline', () => {
  test('deve retornar 3 itens (exame + receita + lab) na timeline', async () => {
    const patient = await db.createPatient({
      name: 'Paciente Teste Timeline', species: 'dog', breed: 'SRD', owner_name: 'Tutor Teste', weight: 10, scope: 'VET'
    });
    const exam = await db.createExam({
      patient_id: patient.id,
      exam_type: 'ultrasound_abd',
      date: new Date('2025-01-03T10:00:00.000Z').toISOString(),
      organs_data: [{ organ_name: 'Fígado', report_text: 'Normal', measurements: {} }],
      images: []
    });
    await db.createPrescription({
      patient_id: patient.id,
      doctor_name: 'Dr Teste',
      date: new Date('2025-01-03T11:00:00.000Z').toISOString(),
      items: [{ drug_id: 'drug-test', drug_name: 'Dipirona', dosage: '1 cp a cada 8h', quantity: '1 cx' }],
      notes: 'Obs'
    });
    await localDb.lab_exams.put({
      id: 'lab-test-1',
      patient_id: patient.id,
      patient_name: patient.name,
      date: new Date('2025-01-03T12:00:00.000Z').toISOString(),
      exam_type: 'hemogram',
      results: [{ parameter: 'Hematócrito', value: '40', unit: '%', ref_min: 37, ref_max: 55, flag: 'normal' }],
      status: 'draft'
    });

    const timeline = await db.getPatientTimeline(patient.id);
    expect(timeline).toHaveLength(3);
    expect(timeline.map((x) => x.collection).sort()).toEqual(['exams', 'lab_exams', 'prescriptions']);

    await db.deletePatient(patient.id);
    await db.deleteExam(exam.id);
    await localDb.lab_exams.delete('lab-test-1');
  });
});

describe('pacientes veterinários', () => {
  test('salva espécie, raça, peso, sexo/castração e tutor; default scope VET', async () => {
    const p = await db.createPatient({
      name: 'Thor', species: 'dog', breed: 'Labrador', weight: '32.5', sex: 'male', neutered: 'yes', owner_name: 'Ana'
    });
    const stored = await db.getPatient(p.id);
    expect(stored).toMatchObject({ scope: 'VET', species: 'dog', breed: 'Labrador', weight: 32.5, sex: 'male', neutered: 'yes', owner_name: 'Ana' });

    const updated = await db.updatePatient(p.id, { weight: '33', neutered: 'no' });
    expect(updated.weight).toBe(33);
    expect(updated.neutered).toBe('no');

    const vets = await db.getPatients({ scope: 'VET' });
    expect(vets.some((x) => x.id === p.id)).toBe(true);
    await db.deletePatient(p.id);
    expect(await db.getPatient(p.id)).toBeNull();
  });
});

describe('fluxo de ultrassom', () => {
  test('createUltrasoundExam cria rascunho abdominal com peso do paciente e persiste laudo/medidas', async () => {
    const p = await db.createPatient({ name: 'Mimi', species: 'cat', breed: 'SRD', weight: 4.2, sex: 'female' });
    const exam = await db.createUltrasoundExam(p);
    expect(exam).toMatchObject({ patient_id: p.id, exam_type: 'ultrasound_abd', status: 'draft', exam_weight: 4.2 });

    const organs = [{ organ_name: 'Fígado', report_text: 'Dimensões {M1}', measurements: { m1: { value: '3.1', unit: 'cm' } } }];
    await db.updateExam(exam.id, { organs_data: organs, referring_vet: 'Dr. X' });
    const reloaded = await db.getExam(exam.id);
    expect(reloaded.organs_data).toEqual(organs);
    expect(reloaded.referring_vet).toBe('Dr. X');

    // Rascunho com laudo não é reaproveitado; rascunho vazio é.
    const second = await db.createUltrasoundExam(p);
    expect(second.id).not.toBe(exam.id);
    const third = await db.createUltrasoundExam(p);
    expect(third.id).toBe(second.id);
    await db.deletePatient(p.id);
  });

  test('imagens/DICOM ficam no IndexedDB e são removidas em cascata com o paciente', async () => {
    const p = await db.createPatient({ name: 'Bidu', species: 'dog', breed: 'SRD' });
    const exam = await db.createUltrasoundExam(p);
    const bytes = new Uint8Array([68, 73, 67, 77, 1, 2, 3]);
    const img = await db.saveImage(exam.id, {
      filename: 'us.dcm', data: 'data:application/dicom;base64,AA==', mimeType: 'application/dicom',
      file: new Blob([bytes], { type: 'application/dicom' })
    });
    expect(img.original_media_id).toBeTruthy();
    expect((await db.getExam(exam.id)).images).toHaveLength(1);
    const media = await localDb.media.get(img.original_media_id);
    expect(new Uint8Array(await media.blob.arrayBuffer())).toEqual(bytes);
    expect(await getMediaDataUrl(img.original_media_id)).toMatch(/^data:application\/dicom;base64,/);

    await db.deletePatient(p.id);
    expect(await db.getExam(exam.id)).toBeNull();
    expect(await localDb.media.get(img.original_media_id)).toBeUndefined();
  });
});

describe('templates, valores de referência e timbrados', () => {
  test('CRUD de templates', async () => {
    const t = await db.createTemplate({ title: 'Fígado normal', organ: 'Fígado', text: 'Sem alterações.' });
    expect(t.lang).toBe('pt');
    await db.updateTemplate(t.id, { text: 'Editado.' });
    expect((await db.getTemplates('Fígado')).find((x) => x.id === t.id).text).toBe('Editado.');
    await db.deleteTemplate(t.id);
    expect((await db.getTemplates('Fígado')).find((x) => x.id === t.id)).toBeUndefined();
  });

  test('CRUD de valores de referência por espécie/órgão', async () => {
    const r = await db.createReferenceValue({ species: 'dog', organ: 'Rins', parameter: 'Comprimento', min_value: 5, max_value: 7, unit: 'cm' });
    expect(await db.getReferenceValues({ species: 'dog', organ: 'Rins' })).toEqual(expect.arrayContaining([expect.objectContaining({ id: r.id })]));
    await db.updateReferenceValue(r.id, { max_value: 8 });
    expect((await localDb.reference_values.get(r.id)).max_value).toBe(8);
    await db.deleteReferenceValue(r.id);
    expect(await localDb.reference_values.get(r.id)).toBeUndefined();
  });

  test('perfil com timbrado/assinatura ativa nas configurações locais', async () => {
    const letterhead = 'data:image/png;base64,iVBORw0KGgo=';
    const prof = await db.createProfile('Clínica Teste', { clinic_name: 'Clínica Teste', veterinarian_name: 'Dra. Vet', crmv: '123', letterhead_path: letterhead });
    const s = await db.getSettings();
    expect(s).toMatchObject({ active_profile_id: prof.id, clinic_name: 'Clínica Teste', letterhead_path: letterhead, crmv: '123' });
    expect(s.practice_type).toBe('vet');
    await db.deleteProfile(prof.id);
    expect((await db.getSettings()).active_profile_id).toBeNull();
  });
});
