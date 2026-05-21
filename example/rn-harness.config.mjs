import {
  androidPlatform,
  androidEmulator,
} from '@react-native-harness/platform-android';
import {
  applePlatform,
  appleSimulator,
} from '@react-native-harness/platform-apple';
import { webPlatform, chromium } from '@react-native-harness/platform-web';

const config = {
  entryPoint: './index.js',
  appRegistryComponentName: 'MmkvExample',

  runners: [
    androidPlatform({
      name: 'android',
      device: androidEmulator(
        process.env.HARNESS_ANDROID_AVD ?? 'Pixel_8_API_35',
        {
          apiLevel: Number(process.env.HARNESS_ANDROID_API_LEVEL ?? 35),
          profile: process.env.HARNESS_ANDROID_PROFILE ?? 'pixel_6',
          diskSize: '1G',
          heapSize: '1G',
        }
      ),
      bundleId: 'com.mrousavy.mmkv.example',
    }),
    applePlatform({
      name: 'ios',
      device: appleSimulator(
        process.env.HARNESS_IOS_DEVICE ?? 'iPhone 16 Pro',
        process.env.HARNESS_IOS_VERSION ?? '18.6'
      ),
      bundleId: 'com.mrousavy.mmkv.example',
    }),
    webPlatform({
      name: 'web',
      browser: chromium(process.env.HARNESS_WEB_URL ?? 'http://localhost:8081'),
    }),
  ],
  defaultRunner: 'android',
  bridgeTimeout: 120000,

  resetEnvironmentBetweenTestFiles: true,
  unstable__skipAlreadyIncludedModules: false,
};

export default config;
