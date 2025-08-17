import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { validateEnv } from '@/config/env';
import { Container } from './Container';

const styles = {
  container: 'flex-1 bg-gray-50',
  content: 'flex-1 p-4',
  header: 'mb-6',
  title: 'text-2xl font-bold text-gray-800 mb-2',
  subtitle: 'text-gray-600',
  buttonContainer: 'flex-row justify-between mb-6',
  button: 'flex-1 bg-blue-500 rounded-lg p-4 mx-1 items-center',
  buttonDisabled: 'bg-gray-400',
  buttonText: 'text-white font-semibold text-center',
  buttonIcon: 'mb-2',
  imageGrid: 'flex-row flex-wrap justify-between mb-6',
  imageContainer: 'w-[48%] mb-4 relative',
  image: 'w-full h-32 rounded-lg',
  removeButton:
    'absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center',
  uploadButton: 'bg-green-500 rounded-lg p-4 items-center mb-6',
  uploadButtonDisabled: 'bg-gray-400',
  statusContainer: 'bg-white rounded-lg p-4 mb-4',
  statusText: 'text-center font-medium',
  statusPending: 'text-gray-600',
  statusUploading: 'text-blue-600',
  statusProcessing: 'text-orange-600',
  statusCompleted: 'text-green-600',
  statusFailed: 'text-red-600',
  linkContainer: 'bg-blue-50 rounded-lg p-4 mb-4',
  linkText: 'text-blue-600 text-center font-medium',
  errorContainer: 'bg-red-50 rounded-lg p-4 mb-4',
  errorText: 'text-red-600 text-center',
  resetButton: 'bg-gray-500 rounded-lg p-4 items-center',
  resetButtonText: 'text-white font-semibold',
  progressContainer: 'mt-2',
  progressBar: 'h-2 bg-gray-200 rounded-full',
  progressFill: 'h-full bg-blue-500 rounded-full',
};

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
    if (!product) {
      createNewProduct();
    }

    try {
      await capturePhoto();
    } catch {
      Alert.alert('Error', 'Failed to capture photo');
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

    Alert.alert('Upload Photos', `Upload ${product.images.length} photo(s) and create listing?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Upload', onPress: uploadImages },
    ]);
  };

  const handleRemoveImage = (imageId: string) => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeImage(imageId) },
    ]);
  };

  const getStatusMessage = () => {
    if (!product) return null;

    switch (product.status) {
      case 'pending':
        return { text: 'Ready to upload photos', style: styles.statusPending };
      case 'uploading':
        return { text: 'Uploading photos...', style: styles.statusUploading };
      case 'processing':
        return { text: 'Creating Mercado Libre listing...', style: styles.statusProcessing };
      case 'completed':
        return { text: 'Listing created successfully!', style: styles.statusCompleted };
      case 'failed':
        return { text: 'Failed to create listing', style: styles.statusFailed };
      default:
        return null;
    }
  };

  const canAddPhotos = !product || (product.status === 'pending' && !isUploading);
  const canUpload =
    product && product.images.length > 0 && product.status === 'pending' && !isUploading;
  const showReset = product && (product.status === 'completed' || product.status === 'failed');

  return (
    <Container>
      <ScrollView className={styles.container} showsVerticalScrollIndicator={false}>
        <View className={styles.content}>
          <View className={styles.header}>
            <Text className={styles.title}>Product Photos</Text>
            <Text className={styles.subtitle}>
              Capture or select photos of your product to create a Mercado Libre listing
            </Text>
          </View>

          {error && (
            <View className={styles.errorContainer}>
              <Text className={styles.errorText}>{error}</Text>
            </View>
          )}

          <View className={styles.buttonContainer}>
            <TouchableOpacity
              className={`${styles.button} ${!canAddPhotos ? styles.buttonDisabled : ''}`}
              onPress={handleCapturePhoto}
              disabled={!canAddPhotos}>
              <Ionicons name="camera" size={24} color="white" className={styles.buttonIcon} />
              <Text className={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`${styles.button} ${!canAddPhotos ? styles.buttonDisabled : ''}`}
              onPress={handleSelectFromLibrary}
              disabled={!canAddPhotos}>
              <Ionicons name="images" size={24} color="white" className={styles.buttonIcon} />
              <Text className={styles.buttonText}>Choose Photos</Text>
            </TouchableOpacity>
          </View>

          {product && product.images.length > 0 && (
            <View className={styles.imageGrid}>
              {product.images.map((image) => (
                <View key={image.id} className={styles.imageContainer}>
                  <Image source={{ uri: image.uri }} className={styles.image} resizeMode="cover" />
                  {canAddPhotos && (
                    <TouchableOpacity
                      className={styles.removeButton}
                      onPress={() => handleRemoveImage(image.id)}>
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  )}
                  {uploadProgress[image.id] !== undefined && (
                    <View className={styles.progressContainer}>
                      <View className={styles.progressBar}>
                        <View
                          className={styles.progressFill}
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
            <TouchableOpacity className={styles.uploadButton} onPress={handleUpload}>
              <Text className={styles.buttonText}>Upload Photos & Create Listing</Text>
            </TouchableOpacity>
          )}

          {product && (
            <View className={styles.statusContainer}>
              {(() => {
                const status = getStatusMessage();
                return status ? (
                  <Text className={`${styles.statusText} ${status.style}`}>{status.text}</Text>
                ) : null;
              })()}
            </View>
          )}

          {product?.mercadoLibreUrl && (
            <TouchableOpacity
              className={styles.linkContainer}
              onPress={() => Alert.alert('Listing URL', product.mercadoLibreUrl)}>
              <Text className={styles.linkText}>View Mercado Libre Listing</Text>
            </TouchableOpacity>
          )}

          {showReset && (
            <TouchableOpacity className={styles.resetButton} onPress={reset}>
              <Text className={styles.resetButtonText}>Start New Product</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </Container>
  );
};
