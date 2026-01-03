// Jest setup for RxDB tests
// Provides browser-like APIs in Jest (jsdom) environment.

import 'fake-indexeddb/auto';

// RxDB + leader election relies on BroadcastChannel.
// In Jest/jsdom it might be missing, so we polyfill it.
import { BroadcastChannel } from 'broadcast-channel';

if (typeof globalThis.BroadcastChannel === 'undefined') {
  globalThis.BroadcastChannel = BroadcastChannel;
}

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
