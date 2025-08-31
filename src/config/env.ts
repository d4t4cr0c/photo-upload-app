import Constants from 'expo-constants';

interface EnvConfig {
  BACKEND_API_URL: string;
  FRONTEND_API_KEY: string;
  FRONTEND_WEBHOOK_SECRET?: string;
}

const getEnvConfig = (): EnvConfig => {
  const extra = Constants.expoConfig?.extra;

  const config = {
    BACKEND_API_URL:
      extra?.BACKEND_API_URL || process.env.BACKEND_API_URL || 'http://localhost:3000',
    FRONTEND_API_KEY: extra?.FRONTEND_API_KEY || process.env.FRONTEND_API_KEY || '',
    FRONTEND_WEBHOOK_SECRET: extra?.FRONTEND_WEBHOOK_SECRET || process.env.FRONTEND_WEBHOOK_SECRET,
  };

  return config;
};

export const ENV = getEnvConfig();

export const validateEnv = (): boolean => {
  const requiredFields = ['BACKEND_API_URL', 'FRONTEND_API_KEY'];

  for (const field of requiredFields) {
    if (!ENV[field as keyof EnvConfig]) {
      console.error(`Missing required environment variable: ${field}`);
      return false;
    }
  }

  return true;
};
