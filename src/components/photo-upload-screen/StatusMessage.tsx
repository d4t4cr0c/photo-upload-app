import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Product } from '@/types';

interface StatusMessageProps {
  product: Product | null;
}

const statusInfo = {
  'uploading': { text: 'Cargando fotos', color: 'text-blue-300' },
  'processing': { text: 'Creando publicación en MercadoLibre', color: 'text-orange-300' },
  'completed': { text: 'Publicación creada ✅', color: 'text-green-300' },
  'failed': { text: '❌ Error al crear publicación', color: 'text-red-300' }
};


export const StatusMessage: React.FC<StatusMessageProps> = ({ product }) => {

  const rotationValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    
    // Create a continuous rotation animation
    const animation = Animated.loop(
      Animated.timing(rotationValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    animation.start();
    

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [product?.status, rotationValue]);
  
  // Create rotation interpolation for sand clock animation
  const rotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  
  if (!product || product.status === 'pending') {
    return null;
  }
  
  // Access object properties dynamically
  const currentStatus = statusInfo[product.status];


  return (
    <View className="mb-6 rounded-2xl bg-white/10 px-5 py-6">
      <Text className={`text-center text-lg font-bold ${currentStatus.color}`}>
        {currentStatus.text}
      </Text>
      
      {product.status === 'processing' 
        || product.status === 'uploading'
        && (
        <View className="mt-4 items-center">
          <Animated.Text 
            className="text-3xl"
            style={{ transform: [{ rotate: rotation }] }}
          >
            ⏳
          </Animated.Text>
        </View>
      )}
    </View>
  );
};
