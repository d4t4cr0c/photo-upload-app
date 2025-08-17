import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { v4 as uuidv4 } from 'uuid';
import { ProductImage } from '@/types';

export const requestPermissions = async (): Promise<boolean> => {
  const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
  const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  return cameraStatus === 'granted' && mediaStatus === 'granted';
};

export const capturePhoto = async (): Promise<ProductImage | null> => {
  const hasPermissions = await requestPermissions();
  if (!hasPermissions) {
    throw new Error('Camera permissions are required to capture photos');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const resizedImage = await resizeImage(asset.uri);

  return {
    id: uuidv4(),
    uri: resizedImage.uri,
    filename: `product_${Date.now()}.jpg`,
    uploaded: false,
  };
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
        id: uuidv4(),
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
