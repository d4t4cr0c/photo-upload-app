import React from 'react';
import { View, Text } from 'react-native';
import { Product } from '@/types';

interface StatusMessageProps {
  product: Product | null;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ product }) => {
  const getStatusMessage = () => {
    if (!product) return null;

    switch (product.status) {
      case 'pending':
        return { text: 'Carga tus fotos' };
      case 'uploading':
        return { text: 'Cargando fotos ⏳' };
      case 'processing':
        return { text: 'Creando publicación en MercadoLibre ⏳' };
      case 'completed':
        return { text: 'Publicación creada ✅' };
      case 'failed':
        return { text: '❌ Error al crear publicación' };
      default:
        return null;
    }
  };

  if (!product || product.status === 'pending') {
    return null;
  }

  const status = getStatusMessage();
  if (!status) return null;

  let statusColor = 'text-gray-300';
  switch (product.status) {
    case 'uploading':
      statusColor = 'text-blue-300';
      break;
    case 'processing':
      statusColor = 'text-orange-300';
      break;
    case 'completed':
      statusColor = 'text-green-300';
      break;
    case 'failed':
      statusColor = 'text-red-300';
      break;
  }

  return (
    <View className="mb-6 rounded-2xl bg-white/10 px-5 py-6">
      <Text className={`text-center text-lg font-bold ${statusColor}`}>
        {status.text}
      </Text>
    </View>
  );
};
