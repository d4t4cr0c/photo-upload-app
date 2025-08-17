import Constants from 'expo-constants';

interface EnvConfig {
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  CLOUDINARY_FOLDER: string;
  CLOUDINARY_UPLOAD_PRESET: string;
  FRONTEND_WEBHOOK_URL?: string;
  FRONTEND_WEBHOOK_SECRET?: string;
}

const getEnvConfig = (): EnvConfig => {
  const extra = Constants.expoConfig?.extra;

  return {
    CLOUDINARY_CLOUD_NAME: extra?.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: extra?.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: extra?.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET || '',
    CLOUDINARY_FOLDER: extra?.CLOUDINARY_FOLDER || process.env.CLOUDINARY_FOLDER || 'app-images',
    CLOUDINARY_UPLOAD_PRESET:
      extra?.CLOUDINARY_UPLOAD_PRESET || process.env.CLOUDINARY_UPLOAD_PRESET || '',
    FRONTEND_WEBHOOK_URL: extra?.FRONTEND_WEBHOOK_URL || process.env.FRONTEND_WEBHOOK_URL,
    FRONTEND_WEBHOOK_SECRET: extra?.FRONTEND_WEBHOOK_SECRET || process.env.FRONTEND_WEBHOOK_SECRET,
  };
};

export const ENV = getEnvConfig();

export const validateEnv = (): boolean => {
  const requiredFields = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_UPLOAD_PRESET'];

  for (const field of requiredFields) {
    if (!ENV[field as keyof EnvConfig]) {
      console.error(`Missing required environment variable: ${field}`);
      return false;
    }
  }

  return true;
};
