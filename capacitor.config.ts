import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tradebook.ledger',
  appName: 'Trade Book Ledger',
  webDir: 'dist',
  plugins: {
    Keyboard: {
      resize: undefined, // Changed to undefined to match the expected 'KeyboardResize | undefined' type
      resizeOnFullScreen: true,
    },
  },
};

export default config;
