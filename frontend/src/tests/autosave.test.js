/** @jest-environment node */

import { createAutoSaver } from '../shared/utils/autoSave';
import { normalizePractice, HUMAN_PRACTICE_LOCKED, LICENSE_STATUS } from '../contexts/LicenseContext';

describe('auto-save com debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('grava apenas a última versão após 3s sem digitar', async () => {
    const save = jest.fn().mockResolvedValue();
    const saver = createAutoSaver(save, 3000);
    saver.schedule({ text: 'F' });
    jest.advanceTimersByTime(2000);
    saver.schedule({ text: 'Fígado' });
    jest.advanceTimersByTime(2999);
    expect(save).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    await Promise.resolve();
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ text: 'Fígado' });
    expect(saver.hasPending()).toBe(false);
  });

  test('flush grava imediatamente (fechamento da janela / sair da tela)', async () => {
    const save = jest.fn().mockResolvedValue();
    const saver = createAutoSaver(save, 3000);
    saver.schedule({ m1: '3.2' });
    expect(saver.hasPending()).toBe(true);
    await saver.flush();
    expect(save).toHaveBeenCalledWith({ m1: '3.2' });
    jest.advanceTimersByTime(5000);
    expect(save).toHaveBeenCalledTimes(1);
  });

  test('cancel descarta gravação pendente', () => {
    const save = jest.fn();
    const saver = createAutoSaver(save, 3000);
    saver.schedule({ a: 1 });
    saver.cancel();
    jest.advanceTimersByTime(5000);
    expect(save).not.toHaveBeenCalled();
  });
});

describe('licença local e perfil veterinário', () => {
  test('licença sempre válida e prática travada em veterinária', () => {
    expect(LICENSE_STATUS.isValid).toBe(true);
    expect(HUMAN_PRACTICE_LOCKED).toBe(true);
    expect(normalizePractice('human')).toBe('vet');
    expect(normalizePractice(undefined)).toBe('vet');
  });
});
