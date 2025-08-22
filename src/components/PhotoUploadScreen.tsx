import React from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { Container } from './Container';
import {
  Header,
  PhotoActions,
  ImageGrid,
  UploadButton,
  StatusMessage,
  MercadoLibreButton,
  ResetButton,
  ErrorMessage
} from './photo-upload-screen';

export const PhotoUploadScreen: React.FC = () => {
  const {
    product,
    isUploading,
    isLoadingImages,
    loadingImageCount,
    uploadProgress,
    createNewProduct,
    capturePhoto,
    selectFromLibrary,
    uploadImages,
    removeImage,
    reset,
    errorMsg
  } = usePhotoUpload();

  const handleCapturePhoto = async () => {
    let currentProduct = product;
    if (!currentProduct) {
      try {
        currentProduct = createNewProduct();
      } catch (error) {
        console.error('Failed to create new product:', error);
        return;
      }
    }

    try {
      await capturePhoto(currentProduct);
    } catch (error) {
      Alert.alert(
        'Error',
        `No es posible capturar la imagen: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleSelectFromLibrary = async () => {
    let currentProduct = product;
    if (!currentProduct) {
      try {
        currentProduct = createNewProduct();
      } catch (error) {
        console.error('Failed to create new product:', error);
        return;
      }
    }

    try {
      await selectFromLibrary(currentProduct);
    } catch (error) {
      Alert.alert(
        'Error',
        `No es posible seleccionar la imagen: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleUpload = async () => {
    if (!product || product.images.length === 0) {
      Alert.alert('No hay fotos', 'Por favor seleccione fotos antes de cargar');
      return;
    }

    Alert.alert('Crear Publicación', `¿Cargar ${product.images.length} foto(s) y crear publicación?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => uploadImages() },
    ]);
  };

  const handleRemoveImage = (imageId: string) => {
    removeImage(imageId);
  };

  const canAddPhotos = !product || (product.status === 'pending' && !isUploading && !isLoadingImages);
  
  const canUpload = Boolean(
    product 
    && product.images.length > 0 
    && product.status === 'pending' 
    && !isUploading 
    && !isLoadingImages
  );

  return (
    <View className="flex-1 bg-slate-900 ">
      <Container>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-1 p-6">
            <Header />

            {(!product || product.status === 'pending') && (
              <PhotoActions
                canAddPhotos={canAddPhotos}
                onCapturePhoto={handleCapturePhoto}
                onSelectFromLibrary={handleSelectFromLibrary}
              />
            )}

            <ImageGrid
              product={product}
              isLoadingImages={isLoadingImages}
              loadingImageCount={loadingImageCount}
              uploadProgress={uploadProgress}
              canAddPhotos={canAddPhotos}
              onRemoveImage={handleRemoveImage}
            />

            <UploadButton canUpload={canUpload} onUpload={handleUpload} />

            <StatusMessage product={product} />

            {errorMsg && <ErrorMessage errorMsg={errorMsg} />}

            <MercadoLibreButton product={product} />

            <ResetButton product={product} onReset={reset} />
            
          </View>
        </ScrollView>
      </Container>
    </View>
  );
};
