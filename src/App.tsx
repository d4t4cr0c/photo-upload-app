import { PhotoUploadScreen } from '@/components/PhotoUploadScreen';

// Component to show phone's status bar on top
import { StatusBar } from 'expo-status-bar';

import { useFonts } from '@/hooks/useFonts';

// Activity Indicator: spinner
import { ActivityIndicator, View } from 'react-native';

import '../global.css';

export default function App() {
  const fontsLoaded = useFonts();

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0f172a',
        }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <>
      <PhotoUploadScreen />
      <StatusBar style="light" />
    </>
  );
}
