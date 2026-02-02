/**
 * MOCK ELECTRON API FOR WEB ENVIRONMENT (Bolt.new)
 *
 * Este arquivo simula as APIs do Electron quando rodando em ambiente web.
 * Injete este mock ANTES de montar o React para evitar erros de referência.
 */

console.log('[MockElectron] Initializing mock APIs for web environment...');

const createElectronMock = () => {
  const mockIpcRenderer = {
    invoke: async (channel, ...args) => {
      console.log(`[MockElectron] IPC invoke: ${channel}`, args);

      switch (channel) {
        case 'save-file':
          console.log('[MockElectron] save-file called (simulated success)');
          return { success: true, message: 'File saved (mock)' };

        case 'get-paths':
          return {
            documents: '/tmp/documents',
            temp: '/tmp',
            userData: '/tmp/userdata'
          };

        case 'read-file':
          console.log('[MockElectron] read-file called (returning empty)');
          return null;

        case 'write-file':
          console.log('[MockElectron] write-file called (simulated success)');
          return { success: true };

        case 'open-external':
          console.log('[MockElectron] open-external called:', args[0]);
          window.open(args[0], '_blank');
          return { success: true };

        default:
          console.warn(`[MockElectron] Unhandled IPC channel: ${channel}`);
          return null;
      }
    },

    on: (channel, callback) => {
      console.log(`[MockElectron] IPC on: ${channel}`);
      return () => {}; // return unsubscribe function
    },

    send: (channel, ...args) => {
      console.log(`[MockElectron] IPC send: ${channel}`, args);
    }
  };

  const mockApi = {
    getMachineId: async () => {
      const mockId = 'web-environment-mock-id';
      console.log(`[MockElectron] getMachineId() -> ${mockId}`);
      return mockId;
    },

    getPlatform: () => {
      console.log('[MockElectron] getPlatform() -> web');
      return 'web';
    },

    saveFile: async (filename, content) => {
      console.log(`[MockElectron] saveFile(${filename}) - simulating save`);

      // Simula salvamento usando download do browser
      try {
        const blob = new Blob([content], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        return { success: true };
      } catch (e) {
        console.error('[MockElectron] saveFile error:', e);
        return { success: false, error: e.message };
      }
    },

    readFile: async (filepath) => {
      console.log(`[MockElectron] readFile(${filepath}) - not supported in web`);
      return null;
    }
  };

  return {
    ipcRenderer: mockIpcRenderer,
    api: mockApi
  };
};

// Injeta o mock no window se não existir
if (!window.electron && !window.api) {
  const mock = createElectronMock();
  window.electron = mock;
  window.api = mock.api;
  console.log('[MockElectron] Mock APIs injected successfully');
} else {
  console.log('[MockElectron] Native Electron APIs detected, skipping mock');
}
