import React from 'react';
import { View, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types';

interface ImageGridProps {
  product: Product | null;
  isLoadingImages: boolean;
  loadingImageCount: number;
  canAddPhotos: boolean;
  onRemoveImage: (imageId: string) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  product,
  isLoadingImages,
  loadingImageCount,
  canAddPhotos,
  onRemoveImage,
}) => {
  const handleRemoveImage = (imageId: string) => {
    Alert.alert('Eliminar Foto', '¿Desea eliminar esta foto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => onRemoveImage(imageId) },
    ]);
  };

  if (!((product && product.images.length > 0) || isLoadingImages)) {
    return null;
  }

  const skeletons = [...Array(loadingImageCount)];

  return (
    <View className="mb-8 flex-row flex-wrap justify-between">
      {/* Show actual images */}
      {product &&
        product.images.map((image) => (
          <View key={image.id} className="relative mb-4 w-[48%]">
            <Image
              source={{ uri: image.uri }}
              className="h-60 w-full rounded-2xl"
              resizeMode="cover"
            />
            {canAddPhotos && (
              <TouchableOpacity
                className="absolute -right-3 -top-3 h-8 w-8 items-center justify-center rounded-full bg-red-500 shadow-lg"
                onPress={() => handleRemoveImage(image.id)}>
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            )}
          </View>
        ))}

      {/* Show loading skeletons when processing images */}
      {isLoadingImages &&
        skeletons.map((item, index) => (
          <View key={`skeleton-${index}`} className="relative mb-4 w-[48%]">
            <View className="h-60 w-full items-center justify-center rounded-2xl bg-gray-700/50">
              {/* Spinner */}
              <ActivityIndicator size="large" color="#93C5FD" />
            </View>
          </View>
        ))}
    </View>
  );
};
