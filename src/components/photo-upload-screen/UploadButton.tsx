import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface UploadButtonProps {
  canUpload: boolean;
  onUpload: () => void;
}

export const UploadButton: React.FC<UploadButtonProps> = ({ canUpload, onUpload }) => {
  
  
  if (!canUpload) return null;
  

  return (
    <TouchableOpacity
      className="mb-8 items-center rounded-2xl bg-green-600 px-8 py-5 shadow-lg"
      onPress={onUpload}>
      <Text className="text-lg font-bold text-white">
        Publicar en MercadoLibre
      </Text>
    </TouchableOpacity>
  );
};
