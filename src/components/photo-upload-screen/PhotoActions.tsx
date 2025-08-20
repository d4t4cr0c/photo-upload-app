import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PhotoActionsProps {
  canAddPhotos: boolean;
  onCapturePhoto: () => void;
  onSelectFromLibrary: () => void;
}

export const PhotoActions: React.FC<PhotoActionsProps> = ({
  canAddPhotos,
  onCapturePhoto,
  onSelectFromLibrary,
}) => {
  return (
    <View className="mb-8 flex-row justify-between">
      <TouchableOpacity
        className={`mx-2 flex-1 items-center rounded-2xl px-6 py-4 shadow-lg ${
          !canAddPhotos ? 'bg-gray-600 opacity-50' : 'bg-gray-600'
        }`}
        onPress={onCapturePhoto}
        disabled={!canAddPhotos}>
        <Ionicons name="camera" size={72} color="white" className="mb-1" />
        <Text className="mt-3 text-sm font-bold text-white text-center">
          Tomar fotos
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`mx-2 flex-1 items-center rounded-2xl px-6 py-4 shadow-lg ${
          !canAddPhotos ? 'bg-gray-600 opacity-50' : 'bg-gray-600'
        }`}
        onPress={onSelectFromLibrary}
        disabled={!canAddPhotos}>
        <Ionicons name="images" size={72} color="white" className="mb-1" />
        <Text className="mt-3 text-sm font-bold text-white text-center">
          Elegir fotos
        </Text>
      </TouchableOpacity>
    </View>
  );
};
