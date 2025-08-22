import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat, ImageResult } from 'expo-image-manipulator';
import { ProductImage } from '@/types';

// Simple UUID alternative for React Native
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// REQUEST PERMISSIONS TO USER
export const requestPermissions = async (): Promise<boolean> => {
  const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
  const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  const hasPermissions = cameraStatus === 'granted' && mediaStatus === 'granted';
  return hasPermissions;
};


// TAKE PHOTO
export const capturePhoto = async (onProcessingStart?: () => void): Promise<ProductImage | null> => {

  try {
    const hasPermissions = await requestPermissions();

    if (!hasPermissions) {
      throw new Error('Camera permissions are required to capture photos');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      // Use full quality, resize later, to avoid delay
      quality: 1.0, 
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];

    // Notify that we're about to start processing the image
    if (onProcessingStart) {
      onProcessingStart();
    }

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



// Select images from Photo Library
export const selectFromLibrary = async (onProcessingStart?: (count: number) => void): Promise<ProductImage[]> => {
  try {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      throw new Error('Media library permissions are required to select photos');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      allowsEditing: false, // Disable editing to improve performance
      // Use full quality for selection, resize later, to avoid delay
      quality: 1.0, 
      selectionLimit: 10,
    });

    if (result.canceled || !result.assets) {
      return [];
    }

    // Notify that we're about to start processing images
    if (onProcessingStart) {
      onProcessingStart(result.assets.length);
    }

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
  } catch (error) {
    throw error;
  }
};


// RESIZE IMAGES TO 1500 px
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
