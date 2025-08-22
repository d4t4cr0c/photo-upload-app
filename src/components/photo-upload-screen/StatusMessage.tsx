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
    
    // Create a sequence animation with pauses
    const createAnimation = () => {
      return Animated.sequence([
        // Rotate 180 degrees
        Animated.timing(rotationValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        // Pause for half a second
        Animated.delay(500),
        // Rotate another 180 degrees (back to start)
        Animated.timing(rotationValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        // Pause for half a second
        Animated.delay(500),
      ]);
    };

    const animation = Animated.loop(createAnimation());
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
      
      {(product.status === 'processing' || product.status === 'uploading') && (
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
