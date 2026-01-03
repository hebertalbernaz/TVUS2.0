/** @jest-environment jsdom */

import { getDatabase } from '../core/database/db';
import { db } from '../services/database';

/**
 * Blindagem: garante que a timeline do paciente sempre inclua
 * - 1 exame de imagem (collection: exams)
 * - 1 receita (collection: prescriptions)
 * - 1 exame laboratorial (collection: lab_exams)
 */
describe('db.getPatientTimeline', () => {
  test('deve retornar 3 itens (exame + receita + lab) na timeline', async () => {
    const rxdb = await getDatabase();

    // 1) cria paciente mock
    const patient = await db.createPatient({
      name: 'Paciente Teste Timeline',
      species: 'dog',
      breed: 'SRD',
      owner_name: 'Tutor Teste',
      weight: 10,
      scope: 'VET'
    });

    // 2) insere 1 Exame de Imagem
    const exam = await db.createExam({
      patient_id: patient.id,
      exam_type: 'ultrasound_abd',
      date: new Date('2025-01-03T10:00:00.000Z').toISOString(),
      organs_data: [{ organ_name: 'Fígado', report_text: 'Normal', measurements: {} }],
      images: []
    });

    // 3) insere 1 Receita
    await rxdb.prescriptions.insert({
      id: 'rx-test-1',
      patient_id: patient.id,
      doctor_name: 'Dr Teste',
      date: new Date('2025-01-03T11:00:00.000Z').toISOString(),
      items: [
        {
          drug_id: 'drug-test',
          drug_name: 'Dipirona',
          dosage: '1 cp a cada 8h',
          quantity: '1 cx'
        }
      ],
      notes: 'Obs'
    });

    // 4) insere 1 Exame Laboratorial
    await rxdb.lab_exams.insert({
      id: 'lab-test-1',
      patient_id: patient.id,
      patient_name: patient.name,
      patient_species: patient.species,
      owner_name: patient.owner_name,
      date: new Date('2025-01-03T12:00:00.000Z').toISOString(),
      veterinarian_name: 'Dr Lab',
      requesting_vet: 'Dr Solicitante',
      exam_type: 'hemogram',
      exam_type_label: 'Hemograma Completo',
      results: [
        {
          parameter: 'Hematócrito',
          value: '40',
          unit: '%',
          ref_min: 37,
          ref_max: 55,
          flag: 'normal',
          category: 'eritrograma'
        }
      ],
      conclusion: 'Sem alterações',
      notes: '',
      clinical_history: '',
      status: 'draft',
      created_at: new Date('2025-01-03T12:00:00.000Z').toISOString(),
      updated_at: new Date('2025-01-03T12:00:00.000Z').toISOString(),
      finalized_at: null,
      finalized_by: ''
    });

    // 5) chama timeline
    const timeline = await db.getPatientTimeline(patient.id);

    // 6) asserts
    expect(Array.isArray(timeline)).toBe(true);
    expect(timeline).toHaveLength(3);

    const collections = timeline.map((x) => x.collection).sort();
    expect(collections).toEqual(['exams', 'lab_exams', 'prescriptions'].sort());

    // cleanup (best-effort)
    await db.deletePatient(patient.id);
    await db.deleteExam(exam.id);
  });
});
