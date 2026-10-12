/** @jest-environment node */

import { localDb, getLocalDb, saveMediaBlob } from '../core/database/localDb';
import { createBackup, readBackupFile, restoreBackup } from '../services/cryptoBackup';

describe('backup físico (zip) e restore', () => {
  test('exporta e restaura banco + arquivos DICOM, com e sem senha', async () => {
    await getLocalDb();
    await localDb.patients.put({ id: 'p-bkp', scope: 'VET', name: 'Rex Backup' });
    await localDb.exams.put({ id: 'e-bkp', patient_id: 'p-bkp', date: '2025-02-01', images: [] });
    const dicomBytes = new Uint8Array([0, 1, 2, 3, 68, 73, 67, 77]);
    const media = await saveMediaBlob('e-bkp', new Blob([dicomBytes], { type: 'application/dicom' }), 'a.dcm');

    for (const password of [null, 'segredo']) {
      const { blob } = await createBackup(password);

      await localDb.patients.clear();
      await localDb.media.clear();

      if (password) {
        await expect(readBackupFile(blob, 'errada')).rejects.toThrow('Senha incorreta');
      }
      const parsed = await readBackupFile(blob, password);
      expect(parsed.manifest.tables.patients).toBeGreaterThanOrEqual(1);
      await restoreBackup(parsed);

      expect((await localDb.patients.get('p-bkp')).name).toBe('Rex Backup');
      const restored = await localDb.media.get(media.id);
      expect(restored.exam_id).toBe('e-bkp');
      expect(new Uint8Array(await restored.blob.arrayBuffer())).toEqual(dicomBytes);
    }
  });

  test('rejeita arquivos que não são backup', async () => {
    await expect(readBackupFile(new Blob(['qualquer coisa']))).rejects.toThrow('inválido');
  });
});
