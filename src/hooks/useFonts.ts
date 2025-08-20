import { useFonts as useExpoFonts } from 'expo-font';

export const useFonts = () => {
  const [fontsLoaded] = useExpoFonts({
    'MuseoModerno-Regular': require('../../assets/fonts/MuseoModerno/static/MuseoModerno-Regular.ttf'),
    'MuseoModerno-Medium': require('../../assets/fonts/MuseoModerno/static/MuseoModerno-Medium.ttf'),
    'MuseoModerno-SemiBold': require('../../assets/fonts/MuseoModerno/static/MuseoModerno-SemiBold.ttf'),
    'MuseoModerno-Bold': require('../../assets/fonts/MuseoModerno/static/MuseoModerno-Bold.ttf'),
    'MuseoModerno-ExtraBold': require('../../assets/fonts/MuseoModerno/static/MuseoModerno-ExtraBold.ttf'),
    'MuseoModerno-Black': require('../../assets/fonts/MuseoModerno/static/MuseoModerno-Black.ttf'),
  });

  return fontsLoaded;
};
