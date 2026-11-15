/** @jest-environment node */

import { localDb, getLocalDb, saveMediaBlob } from '../core/database/localDb';
import { createBackup, readBackupFile, restoreBackup } from '../services/cryptoBackup';
import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';

const seed = async () => {
  await localDb.patients.put({ id: 'p-bkp', scope: 'VET', name: 'Rex Backup', species: 'dog', neutered: 'yes' });
  await localDb.exams.put({ id: 'e-bkp', patient_id: 'p-bkp', date: '2025-02-01', exam_type: 'ultrasound_abd', organs_data: [{ organ_name: 'Baço', report_text: 'Normal' }], images: [] });
  await localDb.templates.put({ id: 't-bkp', title: 'Baço', organ: 'Baço', lang: 'pt', text: 'Normal' });
  await localDb.reference_values.put({ id: 'r-bkp', species: 'dog', organ: 'Baço', parameter: 'Espessura' });
  await localDb.profiles.put({ id: 'prof-bkp', name: 'Perfil', letterhead_path: 'data:image/png;base64,AAA=' });
  await localDb.settings.put({ id: 'global_settings', practice_type: 'vet', clinic_name: 'Clínica Backup' });
};

describe('backup físico (zip) e restore', () => {
  beforeAll(async () => {
    await getLocalDb();
    await seed();
  });

  test('exporta e restaura banco + arquivos DICOM, com e sem senha', async () => {
    const dicomBytes = new Uint8Array([0, 1, 2, 3, 68, 73, 67, 77]);
    const media = await saveMediaBlob('e-bkp', new Blob([dicomBytes], { type: 'application/dicom' }), 'a.dcm');

    for (const password of [null, 'segredo']) {
      const { blob } = await createBackup(password);
      await Promise.all(localDb.tables.map((t) => t.clear()));

      if (password) await expect(readBackupFile(blob, 'errada')).rejects.toThrow('Senha incorreta');
      const parsed = await readBackupFile(blob, password);
      await restoreBackup(parsed);

      expect((await localDb.patients.get('p-bkp')).name).toBe('Rex Backup');
      expect((await localDb.exams.get('e-bkp')).organs_data[0].report_text).toBe('Normal');
      const restored = await localDb.media.get(media.id);
      expect(restored.exam_id).toBe('e-bkp');
      expect(new Uint8Array(await restored.blob.arrayBuffer())).toEqual(dicomBytes);
    }
  });

  test('inclui TODAS as tabelas e configurações (templates, referências, timbrados, settings)', async () => {
    const { blob, counts } = await createBackup(null);
    expect(Object.keys(counts).sort()).toEqual(localDb.tables.map((t) => t.name).sort());
    const parsed = await readBackupFile(blob);
    expect(parsed.data.templates.find((t) => t.id === 't-bkp')).toBeTruthy();
    expect(parsed.data.reference_values.find((r) => r.id === 'r-bkp')).toBeTruthy();
    expect(parsed.data.profiles.find((p) => p.id === 'prof-bkp').letterhead_path).toContain('data:image');
    expect(parsed.data.settings.find((s) => s.id === 'global_settings').clinic_name).toBe('Clínica Backup');
    for (const t of localDb.tables) expect(parsed.data[t.name]).toHaveLength(counts[t.name]);
  });

  test('rejeita backup incompleto (registros ou arquivos ausentes) sem tocar nos dados atuais', async () => {
    const { blob } = await createBackup(null);
    const entries = unzipSync(new Uint8Array(await blob.arrayBuffer()));

    const truncated = { ...entries, 'db/patients.json': strToU8('[]') };
    await expect(readBackupFile(new Blob([zipSync(truncated)]))).rejects.toThrow('Backup incompleto');

    const noMedia = Object.fromEntries(Object.entries(entries).filter(([k]) => !k.startsWith('media/')));
    const manifest = JSON.parse(strFromU8(entries['manifest.json']));
    expect(manifest.tables.media).toBeGreaterThan(0);
    await expect(readBackupFile(new Blob([zipSync(noMedia)]))).rejects.toThrow('ausente');

    expect(await localDb.patients.get('p-bkp')).toBeTruthy();
  });

  test('rejeita arquivos que não são backup', async () => {
    await expect(readBackupFile(new Blob(['qualquer coisa']))).rejects.toThrow('inválido');
  });
});
