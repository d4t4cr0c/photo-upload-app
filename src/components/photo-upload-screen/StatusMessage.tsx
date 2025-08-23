import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types';

interface StatusMessageProps {
  product: Product | null;
}

const statusInfo = {
  'uploading': { 
    text: 'Cargando imágenes', 
    color: 'text-blue-400/90',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-400/20',
    icon: 'cloud-upload-outline' as const,
    iconColor: '#60a5fa'
  },
  'processing': { 
    text: 'Procesando imágenes...', 
    color: 'text-yellow-400/90',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-400/20',
    icon: 'hourglass-outline' as const,
    iconColor: '#facc15'
  },
  'completed': { 
    text: '¡Publicación creada!', 
    color: 'text-emerald-400/90',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-400/20',
    icon: 'checkmark-circle-outline' as const,
    iconColor: '#34d399'
  },
  'failed': { 
    text: 'Error al procesar imágenes', 
    color: 'text-red-400/90',
    bgColor: 'bg-red-300/12',
    borderColor: 'border-red-400/25',
    icon: 'close-circle-outline' as const,
    iconColor: '#f87171'
  }
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
    <View className={`mb-6 rounded-xl border ${currentStatus.borderColor} ${currentStatus.bgColor} p-4`}>
      <View className="flex-row items-center justify-center">


        {(product.status === 'processing' || product.status === 'uploading') ? (
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Ionicons name="hourglass-outline" size={30} color={currentStatus.iconColor} />
          </Animated.View>
        ) : (
          <Ionicons name={currentStatus.icon} size={30} color={currentStatus.iconColor} />
        )}

        <Text className={`ml-2 text-xl font-medium ${currentStatus.color}`}>
          {currentStatus.text}
        </Text>

      </View>
    </View>
  );
};
