
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.haul.app',
  appName: 'haul-it-invoice-pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://049249e6-7602-4626-a259-1031cf52efb7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
