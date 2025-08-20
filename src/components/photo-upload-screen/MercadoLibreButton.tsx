import React from 'react';
import { Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { Product } from '@/types';

interface MercadoLibreButtonProps {
  product: Product | null;
}

export const MercadoLibreButton: React.FC<MercadoLibreButtonProps> = ({ product }) => {
  const handleOpenUrl = async () => {
    if (product?.mercadoLibreUrl) {
      try {
        const supported = await Linking.canOpenURL(product.mercadoLibreUrl);
        if (supported) {
          await Linking.openURL(product.mercadoLibreUrl);
        } else {
          Alert.alert('Error', 'No se puede abrir la URL');
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo abrir la URL');
      }
    }
  };

  if (!product?.mercadoLibreUrl) {
    return null;
  }

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
