import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress: () => void;
  disabled?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  text,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      className={`mx-2 flex-1 items-center rounded-2xl px-6 py-4 shadow-lg ${
        disabled ? 'bg-gray-600 opacity-50' : 'bg-gray-600'
      }`}
      onPress={onPress}
      disabled={disabled}>
      <Ionicons name={icon} size={72} color="white" className="mb-1" />
      <Text className="mt-3 text-base font-bold text-white text-center">
        {text}
      </Text>
    </TouchableOpacity>
  );
};
