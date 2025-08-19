import 'dotenv/config';

export default {
  expo: {
    name: 'photo-upload-app',
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
      CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER,
      CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET,
      FRONTEND_WEBHOOK_URL: process.env.FRONTEND_WEBHOOK_URL,
      FRONTEND_WEBHOOK_SECRET: process.env.FRONTEND_WEBHOOK_SECRET,
    },

    plugins: [
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you share them with your friends.",
          "cameraPermission": "The app accesses your camera to let you take photos and share them with your friends.",
          "microphonePermission": false
        }
      ]
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
      infoPlist: {
        "NSCameraUsageDescription": "This app needs access to camera to take photos.",
        "NSPhotoLibraryUsageDescription": "This app needs access to photo library to select images."
      }
    },
    
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
};
