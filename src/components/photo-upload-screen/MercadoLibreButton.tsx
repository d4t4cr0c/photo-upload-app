import React from 'react';
import { Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { Product } from '@/types';

interface MercadoLibreButtonProps {
  product: Product | null;
}

export const MercadoLibreButton: React.FC<MercadoLibreButtonProps> = ({ product }) => {
  // Si no hay URL no renderizar el componente
  if (!product?.mercadoLibreUrl) return null;
  
  const url = product.mercadoLibreUrl;

  const handleOpenUrl = async () => {
    try {
      console.log('ML Listing URL: ', url);
      
      // For HTTP/HTTPS URLs, skip canOpenURL check on Android as it's unreliable
      // and directly try to open the URL
      if (url.startsWith('http://') || url.startsWith('https://')) {
        await Linking.openURL(url);
      } else {
        // For other schemes, check if supported first
        const supported = await Linking.canOpenURL(url);
        
        if (supported) {
          await Linking.openURL(url);
        } else {
          throw new Error('No se puede abrir la URL');
        }
      }
      
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'No se pudo abrir el enlace de MercadoLibre');
    }
  };

  return (
    <TouchableOpacity
      className="mb-6 rounded-2xl border border-blue-400/30 bg-blue-500/20 px-5 py-6"
      onPress={handleOpenUrl}>
      <Text className="text-center text-lg font-bold text-blue-300">
        Ver publicación 👀
      </Text>
    </TouchableOpacity>
  );
};
