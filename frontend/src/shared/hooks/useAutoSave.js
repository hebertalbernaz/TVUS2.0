import { useEffect, useRef, useState, useCallback } from 'react';
import { createAutoSaver } from '../utils/autoSave';

export const AUTOSAVE_DELAY_MS = 3000;

/**
 * Auto-save com debounce + proteção beforeunload.
 * status: 'idle' | 'pending' | 'saving' | 'saved' | 'error'
 */
export function useAutoSave({ data, onSave, enabled = true, delay = AUTOSAVE_DELAY_MS, resetKey }) {
  const [status, setStatus] = useState('idle');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const saveRef = useRef(onSave);
  saveRef.current = onSave;
  const baselineRef = useRef(null);

  const saverRef = useRef(null);
  if (!saverRef.current) {
    saverRef.current = createAutoSaver(async (payload) => {
      setStatus('saving');
      try {
        await saveRef.current(payload);
        baselineRef.current = JSON.stringify(payload);
        setLastSavedAt(new Date());
        setStatus(saverRef.current.hasPending() ? 'pending' : 'saved');
      } catch (e) {
        console.error('[AutoSave] falhou:', e);
        setStatus('error');
      }
    }, delay);
  }

  // Troca de documento (ex.: outro exame): grava pendências do anterior e recomeça a linha de base.
  const keyRef = useRef(resetKey);
  useEffect(() => {
    if (keyRef.current === resetKey) return;
    keyRef.current = resetKey;
    saverRef.current.flush();
    baselineRef.current = null;
    setStatus('idle');
  }, [resetKey]);

  useEffect(() => {
    if (!enabled) return;
    const json = JSON.stringify(data);
    if (baselineRef.current === null) { baselineRef.current = json; return; }
    if (json === baselineRef.current) {
      if (saverRef.current.hasPending()) { saverRef.current.cancel(); setStatus('saved'); }
      return;
    }
    saverRef.current.schedule(data);
    setStatus('pending');
  }, [data, enabled]);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!saverRef.current.isBusy()) return undefined;
      saverRef.current.flush();
      e.preventDefault();
      e.returnValue = 'Há alterações sendo salvas. Deseja realmente sair?';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    const saver = saverRef.current;
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      saver.flush();
    };
  }, []);

  const flush = useCallback(() => saverRef.current.flush(), []);
  const cancel = useCallback(() => saverRef.current.cancel(), []);
  const markSaved = useCallback((saved) => {
    saverRef.current.cancel();
    baselineRef.current = JSON.stringify(saved ?? data);
    setLastSavedAt(new Date());
    setStatus('saved');
  }, [data]);

  return { status, lastSavedAt, flush, cancel, markSaved };
}
