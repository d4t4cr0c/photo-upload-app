import 'dotenv/config';

export default {
  expo: {
    name: 'mercado fácil IA',
    slug: 'photo-upload-app',
    version: '1.0.0',

    web: {
      favicon: './assets/favicon.png',
    },

    experiments: {
      tsconfigPaths: true,
    },

    extra: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_FOLDER: 'cds-images',
      CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET,
      BACKEND_API_URL: process.env.BACKEND_API_URL,
      FRONTEND_WEBHOOK_URL: process.env.FRONTEND_WEBHOOK_URL,
      FRONTEND_WEBHOOK_SECRET: process.env.FRONTEND_WEBHOOK_SECRET,
      eas: {
        projectId: '6104ca08-7a59-408e-8227-1debc156f029',
      },
    },

    plugins: [
      [
        'expo-image-picker',
        {
          photosPermission: 'The app accesses your photos to let you share them with your friends.',
          cameraPermission:
            'The app accesses your camera to let you take photos and share them with your friends.',
          microphonePermission: false,
        },
      ],
      'expo-font',
    ],

    orientation: 'portrait',
    icon: './assets/icon.png',

    userInterfaceStyle: 'dark',

    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],

    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.d4v1dl3d4.photouploadapp',
      infoPlist: {
        NSCameraUsageDescription: 'This app needs access to camera to take photos.',
        NSPhotoLibraryUsageDescription: 'This app needs access to photo library to select images.',
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: [
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.INTERNET',
      ],
      package: 'com.d4v1dl3d4.photouploadapp',
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
            },
            {
              scheme: 'http',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
  },
};
