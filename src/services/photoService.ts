import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat, ImageResult } from 'expo-image-manipulator';
import { ProductImage } from '@/types';

// Simple UUID alternative for React Native
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);


// REQUEST PERMISSIONS TO USER
export const requestPermissions = async (): Promise<boolean> => {
  const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
  const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  const hasPermissions = cameraStatus === 'granted' && mediaStatus === 'granted';
  return hasPermissions;
};

// TAKE PHOTO
export async function capturePhoto(onStartProcessing: () => void): Promise<ProductImage | null> {
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

    if (result.canceled || !result.assets[0]) return null;

    // Start showing skeleton
    onStartProcessing();

    const asset = result.assets[0];

    const resizedImage = await resizeImage(asset.uri);

    const productImage = {
      id: generateId(),
      uri: resizedImage.uri,
      filename: `image-${generateId()}.jpg`,
      uploaded: false,
    };

    return productImage;
  } catch (error) {
    console.error('❌ Error in capturePhoto:', error);
    throw error;
  }
}

// SELECT IMAGES FROM PHOTO LIBRARY
// Function takes a callback as param
export async function selectFromLibrary(
  onStartProcessing: (count: number) => void
): Promise<ProductImage[]> {
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

    // Early return in cancelled or no immages selected
    if (result.canceled || !result.assets) return [];

    // Show skeletons while processing images, one for each image
    onStartProcessing(result.assets.length);

    // Resize images
    const resizedImages = await Promise.all(
      result.assets.map(async (asset) => {
        const resizedImage = await resizeImage(asset.uri);
        return {
          id: generateId(),
          uri: resizedImage.uri,
          filename: `image-${generateId()}.jpg`,
          uploaded: false,
        };
      })
    );

    return resizedImages;
  } catch (error) {
    console.error('❌ Error in selectFromLibrary:', error);
    throw error;
  }
}

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
