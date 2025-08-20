import React from 'react';
import { View, Text } from 'react-native';

export const Header: React.FC = () => {
  return (
    <View className="mb-8">
      <Text className="mt-16 text-center text-3xl font-museo-bold text-white">
        mercado fácil IA ✨
      </Text>
      <Text className="my-6 text-center text-lg leading-6 text-gray-200">
        Toma o elige fotos de tu producto para crear una publicación en Mercado Libre 
      </Text>
    </View>
  );
};
