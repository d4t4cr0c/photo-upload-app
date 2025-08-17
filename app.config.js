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
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
      CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER,
      CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET,
      FRONTEND_WEBHOOK_URL: process.env.FRONTEND_WEBHOOK_URL,
      FRONTEND_WEBHOOK_SECRET: process.env.FRONTEND_WEBHOOK_SECRET,
    },

    plugins: [],

    orientation: 'portrait',
    icon: './assets/icon.png',

    userInterfaceStyle: 'light',

    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },
  },
};