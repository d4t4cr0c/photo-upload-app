// App.js in root necessary
import 'expo-crypto';
import { validateEnv } from './src/config/env';

import App from './src/App';

if (!validateEnv()) {
  console.error(
    'Configuration Error: Cloudinary credentials are missing. Please check environment configuration.'
  );
}
export default App;
