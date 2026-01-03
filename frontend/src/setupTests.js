// Jest setup for RxDB tests
// Provides browser-like APIs in Jest (jsdom) environment.

import 'fake-indexeddb/auto';

// RxDB + leader election relies on BroadcastChannel.
// In Jest/jsdom it might be missing, so we polyfill it.
// NOTE: Node 18+/jsdom already has BroadcastChannel.
// We should not override it (broadcast-channel library throws if you do).

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
