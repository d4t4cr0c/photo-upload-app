import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ProductImage } from '@/types';

// Simple UUID alternative for React Native
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const requestPermissions = async (): Promise<boolean> => {
  console.log('🔐 Requesting camera permissions...');
  const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
  console.log('🔐 Camera permission status:', cameraStatus);

  console.log('🔐 Requesting media library permissions...');
  const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  console.log('🔐 Media library permission status:', mediaStatus);

  const hasPermissions = cameraStatus === 'granted' && mediaStatus === 'granted';
  console.log('🔐 Final permissions result:', hasPermissions);

  return hasPermissions;
};

export const capturePhoto = async (): Promise<ProductImage | null> => {
  console.log('📸 Starting photo capture...');

  try {
    console.log('🔐 Requesting permissions...');
    const hasPermissions = await requestPermissions();
    console.log('🔐 Permissions result:', hasPermissions);

    if (!hasPermissions) {
      throw new Error('Camera permissions are required to capture photos');
    }

    console.log('📷 Launching camera...');
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    console.log('📷 Camera result:', {
      canceled: result.canceled,
      assetsLength: result.assets?.length,
    });

    if (result.canceled || !result.assets[0]) {
      console.log('📷 Camera was canceled or no image selected');
      return null;
    }

    const asset = result.assets[0];
    console.log('🖼️ Resizing image...', { originalUri: asset.uri });

    const resizedImage = await resizeImage(asset.uri);
    console.log('🖼️ Image resized successfully:', { newUri: resizedImage.uri });

    const productImage = {
      id: generateId(),
      uri: resizedImage.uri,
      filename: `product_${Date.now()}.jpg`,
      uploaded: false,
    };

    console.log('✅ Photo capture completed:', productImage);
    return productImage;
  } catch (error) {
    console.error('❌ Error in capturePhoto:', error);
    throw error;
  }
};

export const selectFromLibrary = async (): Promise<ProductImage[]> => {
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

const resizeImage = async (uri: string): Promise<ImageManipulator.ImageResult> => {
  const { width, height } = await getOriginalImageDimensions(uri);

  let newWidth = width;
  let newHeight = height;

  if (width > height) {
    if (width > 1200) {
      newWidth = 1200;
      newHeight = (height * 1200) / width;
    }
  } else {
    if (height > 1200) {
      newHeight = 1200;
      newWidth = (width * 1200) / height;
    }
  }

  return await ImageManipulator.manipulateAsync(
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
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );
};

const getOriginalImageDimensions = async (
  uri: string
): Promise<{ width: number; height: number }> => {
  const result = await ImageManipulator.manipulateAsync(uri, [], {});
  return { width: result.width, height: result.height };
};
