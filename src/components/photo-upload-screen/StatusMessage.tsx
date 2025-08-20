import React from 'react';
import { View, Text } from 'react-native';
import { Product } from '@/types';

interface StatusMessageProps {
  product: Product | null;
}




export const StatusMessage: React.FC<StatusMessageProps> = ({ product }) => {
  
  if (!product || product.status === 'pending') {
    return null;
  }

  const statusInfo = {
    'uploading': { text: 'Cargando fotos ⏳', color: 'text-blue-300' },
    'processing': { text: 'Creando publicación en MercadoLibre ⏳', color: 'text-orange-300' },
    'completed': { text: 'Publicación creada ✅', color: 'text-green-300' },
    'failed': { text: '❌ Error al crear publicación', color: 'text-red-300' }
  };


  // Access object properties dynamically
  const currentStatus = statusInfo[product.status];

  return (
    <View className="mb-6 rounded-2xl bg-white/10 px-5 py-6">
      <Text className={`text-center text-lg font-bold ${currentStatus.color}`}>
        {currentStatus.text}
      </Text>
    </View>
  );
};
