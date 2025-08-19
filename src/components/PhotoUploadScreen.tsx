import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { validateEnv } from '@/config/env';
import { Container } from './Container';

export const PhotoUploadScreen: React.FC = () => {
  const {
    product,
    isUploading,
    uploadProgress,
    error,
    createNewProduct,
    capturePhoto,
    selectFromLibrary,
    uploadImages,
    removeImage,
    reset,
  } = usePhotoUpload();

  useEffect(() => {
    if (!validateEnv()) {
      Alert.alert(
        'Configuration Error',
        'Please check your environment configuration. Cloudinary credentials are missing.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  const handleCapturePhoto = async () => {
    console.log('🔴 BUTTON PRESSED - Take Photo button clicked');

    let currentProduct = product;
    if (!currentProduct) {
      console.log('Creating new product...');
      try {
        currentProduct = createNewProduct();
        console.log('New product created successfully');
      } catch (error) {
        console.error('❌ Error creating new product:', error);
        return;
      }
      console.log('New product created, continuing...');
    }

    console.log('About to enter try block');
    try {
      console.log('Calling hook capturePhoto function...', typeof capturePhoto);
      await capturePhoto(currentProduct);
      console.log('Hook capturePhoto completed');
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert(
        'Error',
        `Failed to capture photo: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleSelectFromLibrary = async () => {
    if (!product) {
      createNewProduct();
    }

    try {
      await selectFromLibrary();
    } catch {
      Alert.alert('Error', 'Failed to select photos');
    }
  };

  const handleUpload = async () => {
    if (!product || product.images.length === 0) {
      Alert.alert('No Photos', 'Please add some photos before uploading.');
      return;
    }

    Alert.alert('Crear Publicación', `¿Cargar ${product.images.length} foto(s) y crear publicación?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: uploadImages },
    ]);
  };

  const handleRemoveImage = (imageId: string) => {
    Alert.alert('Eliminar Foto', '¿Desea eliminar esta foto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeImage(imageId) },
    ]);
  };

  const getStatusMessage = () => {
    if (!product) return null;

    switch (product.status) {
      case 'pending':
        return { text: 'Carga tus fotos' };
      case 'uploading':
        return { text: 'Cargando fotos...' };
      case 'processing':
        return { text: 'Creando publicación en MercadoLibre...' };
      case 'completed':
        return { text: '¡Publicación creada!' };
      case 'failed':
        return { text: 'Error al crear publicación' };
      default:
        return null;
    }
  };

  const canAddPhotos = !product || (product.status === 'pending' && !isUploading);
  const canUpload =
    product && product.images.length > 0 && product.status === 'pending' && !isUploading;
  const showReset = product && (product.status === 'completed' || product.status === 'failed');

  // Debug logging
  console.log('🔍 DEBUG STATE:', {
    product: product
      ? `id: ${product.id}, status: ${product.status}, images: ${product.images.length}`
      : 'null',
    isUploading,
    canAddPhotos,
    canUpload,
  });

  return (
    <View className="flex-1 bg-slate-900 ">
      <Container>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-1 p-6">
            <View className="mb-8">
              <Text className="mt-10 text-center text-3xl font-extrabold text-white">

                MercadoFácil IA ✨

              </Text>
              <Text className="my-6 text-center text-base leading-6 text-gray-200">
                Sacá o elegí fotos de tu producto para crear una publicación automática en MercadoLibre
              </Text>
            </View>

            {error && (
              <View className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/20 p-5">
                <Text className="text-center font-bold text-red-300">{error}</Text>
              </View>
            )}

            <View className="mb-8 flex-row justify-between">
              <TouchableOpacity
                className={`mx-2 flex-1 items-center rounded-2xl px-6 py-4 shadow-lg ${
                  !canAddPhotos ? 'bg-gray-600 opacity-50' : 'bg-gray-600'
                }`}
                onPress={() => {
                  handleCapturePhoto();
                }}
                disabled={!canAddPhotos}>
                <Ionicons name="camera" size={72} color="white" className="mb-1" />
                <Text className="mt-3 text-sm font-bold text-white text-center ">

                  Tomar foto

                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`mx-2 flex-1 items-center rounded-2xl px-6 py-4 shadow-lg ${
                  !canAddPhotos ? 'bg-gray-600 opacity-50' : 'bg-gray-600'
                }`}
                onPress={handleSelectFromLibrary}
                disabled={!canAddPhotos}>
                <Ionicons name="images" size={72} color="white" className="mb-1" />
                <Text className="mt-3 text-sm font-bold text-white text-center">
                  
                  Elegir foto
                  
                </Text>
              </TouchableOpacity>
            </View>

            {product && product.images.length > 0 && (
              <View className="mb-8 flex-row flex-wrap justify-between">
                {product.images.map((image) => (
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
              </View>
            )}

            {canUpload && (
              <TouchableOpacity
                className="mb-8 items-center rounded-2xl bg-green-600 px-8 py-5 shadow-lg"
                onPress={handleUpload}>
                <Text className="text-lg font-bold text-white">
                  Publicar en MercadoLibre
                </Text>
              </TouchableOpacity>
            )}

            {product && product.status !== 'pending' && (
              <View className="mb-6 rounded-2xl border border-white/20 bg-white/10 p-5">
                {(() => {
                  const status = getStatusMessage();
                  if (!status) return null;

                  let statusColor = 'text-gray-300';
                  switch (product.status) {
                    case 'uploading':
                      statusColor = 'text-blue-300';
                      break;
                    case 'processing':
                      statusColor = 'text-orange-300';
                      break;
                    case 'completed':
                      statusColor = 'text-green-300';
                      break;
                    case 'failed':
                      statusColor = 'text-red-300';
                      break;
                  }

                  return (
               
                      <Text className={`text-center text-lg font-bold ${statusColor}`}>
                        {status.text}
                      </Text>
                    
                  );
                })()}
              </View>
            )}

            {product?.mercadoLibreUrl && (
              <TouchableOpacity
                className="mb-6 rounded-2xl border border-blue-400/30 bg-blue-500/20 p-5"
                onPress={() => Alert.alert('Listing URL', product.mercadoLibreUrl)}>
                <Text className="text-center text-lg font-bold text-blue-300">
                  Ver publicación
                </Text>
              </TouchableOpacity>
            )}

            {showReset && (
              <TouchableOpacity
                className="items-center rounded-2xl bg-green-900 px-8 py-4 shadow-lg"
                onPress={reset}>
                <Text className="text-lg font-bold text-blue-100">
                  Cargar nuevo producto
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </Container>
    </View>
  );
};
