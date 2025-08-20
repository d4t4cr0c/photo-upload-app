import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types';

interface ImageGridProps {
  product: Product | null;
  isLoadingImages: boolean;
  loadingImageCount: number;
  uploadProgress: Record<string, number>;
  canAddPhotos: boolean;
  onRemoveImage: (imageId: string) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  product,
  isLoadingImages,
  loadingImageCount,
  uploadProgress,
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

  return (
    <View className="mb-8 flex-row flex-wrap justify-between">
      {/* Show actual images */}
      {product && product.images.map((image) => (
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
          {uploadProgress[image.id] !== undefined && (
            <View className="mt-3">
              <View className="h-3 rounded-full bg-black/20">
                <View
                  className="h-full rounded-full bg-green-600"
                  style={{ width: `${uploadProgress[image.id]}%` }}
                />
              </View>
            </View>
          )}
        </View>
      ))}
      
      {/* Show loading skeletons when processing images */}
      {isLoadingImages && Array.from({ length: loadingImageCount }, (_, index) => (
        <View key={`skeleton-${index}`} className="relative mb-4 w-[48%]">
          <View className="h-60 w-full rounded-2xl bg-gray-700/50 items-center justify-center">
            <ActivityIndicator size="large" color="#93C5FD" />
            <Text className="mt-3 text-sm font-semibold text-blue-300">
              Procesando...
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};
