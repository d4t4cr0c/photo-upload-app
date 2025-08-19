import { PhotoUploadScreen } from '@/components/PhotoUploadScreen';
import { StatusBar } from 'expo-status-bar';

import '../global.css';

export default function App() {
  return (
    <>
      <PhotoUploadScreen />
      <StatusBar style="light" />
    </>
  );
}
