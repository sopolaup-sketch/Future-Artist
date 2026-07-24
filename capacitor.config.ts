import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.futureartist.app',
  appName: 'Future Artist',
  webDir: 'dist',
  server: {
    url: 'https://future-artist-plum.vercel.app',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false
  }
};

export default config;

