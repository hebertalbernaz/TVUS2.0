// Debouncer de auto-save: agenda gravação após `delay` ms sem novas alterações.
export function createAutoSaver(saveFn, delay = 3000) {
  let timer = null;
  let pending = null;
  let running = Promise.resolve();

  const run = () => {
    clearTimeout(timer);
    timer = null;
    if (pending === null) return running;
    const data = pending;
    pending = null;
    running = running.then(() => saveFn(data));
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
    hasPending: () => pending !== null
  };
}
