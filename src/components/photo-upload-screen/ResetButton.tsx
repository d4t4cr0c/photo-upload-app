import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types';

interface ResetButtonProps {
  product: Product | null;
  onReset: () => void;
}

export const ResetButton: React.FC<ResetButtonProps> = ({ product, onReset }) => {
  const showReset = product && (product.status === 'completed' || product.status === 'failed');

  if (!showReset) {
    return null;
  }

  const buttonText = product.status === 'failed' ? 'Intentar nuevamente' : 'Cargar nuevo producto';

  return (
    <TouchableOpacity
      className="rounded-2xl border border-gray-400/30 bg-green-500/20 px-6 py-6"
      onPress={onReset}>
      <View className="flex-row items-center justify-center">
        <Ionicons name="refresh-outline" size={24} color="#9ca3af" />
        <Text className="ml-2 text-xl font-black text-green-300">
          {buttonText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
