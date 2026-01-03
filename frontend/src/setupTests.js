// Jest setup for RxDB tests
// Provides browser-like APIs in Jest (jsdom) environment.

import 'fake-indexeddb/auto';

// RxDB + leader election relies on BroadcastChannel.
// In Jest/jsdom it might be missing, so we polyfill it.
// NOTE: Node 18+/jsdom already has BroadcastChannel.

// RxDB + uuid may require crypto.getRandomValues
try {
  // Node 18+ has webcrypto
  // eslint-disable-next-line no-undef
  const nodeCrypto = require('crypto');
  if (!globalThis.crypto) {
    globalThis.crypto = nodeCrypto.webcrypto;
  }
} catch (e) {
  // ignore
}

// Polyfill structuredClone for fake-indexeddb
if (!globalThis.structuredClone) {
  globalThis.structuredClone = (obj) => {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      // Fallback for complex objects
      return obj;
    }
  };
}
