import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
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

  return (
    <TouchableOpacity
      className="items-center rounded-2xl border border-blue-400/30 bg-green-950 px-8 py-6 shadow-lg"
      onPress={onReset}>
      <Text className="text-lg font-bold text-blue-100">
        Cargar nuevo producto ↩️
      </Text>
    </TouchableOpacity>
  );
};
