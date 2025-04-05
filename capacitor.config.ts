import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tradebook.ledger',
  appName: 'Trade Book Ledger',
  webDir: 'dist',
  plugins: {
    Keyboard: {
      resize: 'native', // Use 'native' resize mode for iOS
      resizeOnFullScreen: true,
    },
  },
};

export default config;
