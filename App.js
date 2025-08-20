// App.js in root necessary
import 'expo-crypto';
import { validateEnv } from './src/config/env';

if (!validateEnv()) {
  console.error('Configuration Error: Cloudinary credentials are missing. Please check environment configuration.');
}

import App from './src/App';
export default App;
