import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const Header: React.FC = () => {
  return (
    <View className="mb-8">
      <Text className="mt-16 text-center text-4xl font-museo-bold text-amber-200">
        mercado fácil IA &nbsp;
       <Ionicons name="sparkles" size={24} color="#ffbf00"/>
      </Text>
      <Text className="my-6 text-center text-xl leading-6 text-gray-200">
        Toma fotos de tu producto para crear una publicación en Mercado Libre 
      </Text>
    </View>
  );
};
