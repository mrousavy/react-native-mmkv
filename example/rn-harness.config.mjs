const config = {
  include: ['./__tests__/**/*.harness.ts'],

  runners: [
    {
      name: 'android',
      platform: 'android',
      deviceId: 'Pixel_8_API_35',
      bundleId: 'com.mrousavy.mmkv.example',
      activityName: '.MainActivity',
    },
    {
      name: 'ios',
      platform: 'ios',
      deviceId: 'iPhone 16 Pro',
      bundleId: 'com.mrousavy.mmkv.example',
      systemVersion: '18.6',
    },
  ],
  defaultRunner: 'android',
  bridgeTimeout: 120000,
  unstable__skipAlreadyIncludedModules: true,
};

export default config;
