import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UploadButtonProps {
  canUpload: boolean;
  onUpload: () => void;
}

export const UploadButton: React.FC<UploadButtonProps> = ({ canUpload, onUpload }) => {
  if (!canUpload) return null;

  return (
    <TouchableOpacity
      className="mb-8 rounded-2xl border border-green-400/30 bg-green-700 px-6 py-6"
      onPress={onUpload}>
      <View className="flex-row items-center justify-center">
        <Ionicons name="cloud-upload-outline" size={24} color="#86efac" />
        <Text className="ml-2 text-xl font-black text-green-200">Publicar en Mercado Libre</Text>
      </View>
    </TouchableOpacity>
  );
};
