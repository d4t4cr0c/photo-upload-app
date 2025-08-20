import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Product } from '@/types';

interface StatusMessageProps {
  product: Product | null;
}




export const StatusMessage: React.FC<StatusMessageProps> = ({ product }) => {
  const rotationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    
    if (product?.status === 'processing') {
      // Create a continuous rotation animation
      animation = Animated.loop(
        Animated.timing(rotationValue, {
          toValue: 1,
          duration: 2000, // 2 seconds for full rotation
          useNativeDriver: true,
        })
      );
      animation.start();
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [product?.status, rotationValue]);
  
  if (!product || product.status === 'pending') {
    return null;
  }

  const statusInfo = {
    'uploading': { text: 'Cargando fotos ⏳', color: 'text-blue-300' },
    'processing': { text: 'Creando publicación en MercadoLibre', color: 'text-orange-300' },
    'completed': { text: 'Publicación creada ✅', color: 'text-green-300' },
    'failed': { text: '❌ Error al crear publicación', color: 'text-red-300' }
  };


  // Access object properties dynamically
  const currentStatus = statusInfo[product.status];

  // Create rotation interpolation for sand clock animation
  const rotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View className="mb-6 rounded-2xl bg-white/10 px-5 py-6">
      <Text className={`text-center text-lg font-bold ${currentStatus.color}`}>
        {currentStatus.text}
      </Text>
      
      {product.status === 'processing' && (
        <View className="mt-4 items-center">
          <Animated.Text 
            className="text-3xl"
            style={{ transform: [{ rotate: rotation }] }}
          >
            ⏳
          </Animated.Text>
          <Text className="mt-2 text-center text-sm text-gray-400">
            Esto puede tomar algunos minutos...
          </Text>
        </View>
      )}
    </View>
  );
};
