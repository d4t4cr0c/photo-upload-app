import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat, ImageResult } from 'expo-image-manipulator';
import { ProductImage } from '@/types';

// Simple UUID alternative for React Native
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const requestPermissions = async (): Promise<boolean> => {
  const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();

  const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  const hasPermissions = cameraStatus === 'granted' && mediaStatus === 'granted';

  return hasPermissions;
};

export const capturePhoto = async (onLoadingStart?: (count: number) => void): Promise<ProductImage | null> => {

  try {
    const hasPermissions = await requestPermissions();

    if (!hasPermissions) {
      throw new Error('Camera permissions are required to capture photos');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];

    // Call loading callback right before image processing begins
    onLoadingStart?.(1); // Always 1 image from camera

    const resizedImage = await resizeImage(asset.uri);

    const productImage = {
      id: generateId(),
      uri: resizedImage.uri,
      filename: `product_${Date.now()}.jpg`,
      uploaded: false,
    };

    return productImage;
  } catch (error) {
    console.error('❌ Error in capturePhoto:', error);
    throw error;
  }
};

export const selectFromLibrary = async (onLoadingStart?: (count: number) => void): Promise<ProductImage[]> => {
  const hasPermissions = await requestPermissions();
  if (!hasPermissions) {
    throw new Error('Media library permissions are required to select photos');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    allowsEditing: false,
    quality: 0.8,
    selectionLimit: 10,
  });

  if (result.canceled || !result.assets) {
    return [];
  }

  // Call loading callback right before image processing begins
  onLoadingStart?.(result.assets.length);

  const resizedImages = await Promise.all(
    result.assets.map(async (asset) => {
      const resizedImage = await resizeImage(asset.uri);
      return {
        id: generateId(),
        uri: resizedImage.uri,
        filename: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`,
        uploaded: false,
      };
    })
  );

  return resizedImages;
};

const resizeImage = async (uri: string): Promise<ImageResult> => {
  const { width, height } = await getOriginalImageDimensions(uri);

  let newWidth = width;
  let newHeight = height;

  if (width > height) {
    if (width > 1500) {
      newWidth = 1500;
      newHeight = (height * 1500) / width;
    }
  } else {
    if (height > 1500) {
      newHeight = 1500;
      newWidth = (width * 1500) / height;
    }
  }

  return await manipulateAsync(
    uri,
    [
      {
        resize: {
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        },
      },
    ],
    {
      compress: 0.8,
      format: SaveFormat.JPEG,
    }
  );
};

const getOriginalImageDimensions = async (
  uri: string
): Promise<{ width: number; height: number }> => {
  const result = await manipulateAsync(uri, [], {});
  return { width: result.width, height: result.height };
};
