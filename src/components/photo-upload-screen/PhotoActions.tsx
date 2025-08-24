import React from 'react';
import { View } from 'react-native';
import { ActionButton } from './ActionButton';

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
      <ActionButton
        icon="camera"
        text="Tomar fotos"
        onPress={onCapturePhoto}
        disabled={!canAddPhotos}
      />

      <ActionButton
        icon="images"
        text="Elegir fotos"
        onPress={onSelectFromLibrary}
        disabled={!canAddPhotos}
      />
    </View>
  );
};
