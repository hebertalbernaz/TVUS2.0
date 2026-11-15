// Debouncer de auto-save: agenda gravação após `delay` ms sem novas alterações.
export function createAutoSaver(saveFn, delay = 3000) {
  let timer = null;
  let pending = null;
  let running = Promise.resolve();
  let inFlight = 0;

  const run = () => {
    clearTimeout(timer);
    timer = null;
    if (pending === null) return running;
    const data = pending;
    pending = null;
    inFlight += 1;
    running = running
      .then(() => saveFn(data))
      .catch((e) => console.error('[AutoSave]', e))
      .finally(() => { inFlight -= 1; });
    return running;
  };

  return {
    schedule(data) {
      pending = data;
      clearTimeout(timer);
      timer = setTimeout(run, delay);
    },
    flush: run,
    cancel() {
      clearTimeout(timer);
      timer = null;
      pending = null;
    },
    hasPending: () => pending !== null,
    isBusy: () => pending !== null || inFlight > 0
  };
}
