// Jest setup: APIs de navegador para os testes do banco local (Dexie).

// O ambiente "node" do jest não expõe DOMException nem Blob, exigidos pelo fake-indexeddb e pelo backup.
if (typeof globalThis.DOMException === 'undefined') {
  try { atob('*'); } catch (e) { globalThis.DOMException = e.constructor; }
}
if (typeof globalThis.Blob === 'undefined') {
  globalThis.Blob = require('buffer').Blob;
}

try {
  const nodeCrypto = require('crypto');
  if (!globalThis.crypto) {
    globalThis.crypto = nodeCrypto.webcrypto;
  }
} catch (e) {
  // ignore
}

// Clone estruturado mínimo: preserva Blob/binários em vez de serializar via JSON.
if (!globalThis.structuredClone) {
  const clone = (v) => {
    if (v === null || typeof v !== 'object') return v;
    if (v instanceof Date) return new Date(v.getTime());
    if (typeof Blob !== 'undefined' && v instanceof Blob) return v;
    if (ArrayBuffer.isView(v)) return v.slice();
    if (v instanceof ArrayBuffer) return v.slice(0);
    if (Array.isArray(v)) return v.map(clone);
    return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, clone(val)]));
  };
  globalThis.structuredClone = clone;
}

require('fake-indexeddb/auto');
