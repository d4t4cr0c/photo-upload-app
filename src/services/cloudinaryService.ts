import { Cloudinary } from '@cloudinary/url-gen';
import { upload } from 'cloudinary-react-native';
import { ProductImage, UploadResult } from '@/types';
import { ENV } from '@/config/env';

// Single instance for the entire app
let cloudinaryInstance: Cloudinary | null = null;

const getCloudinaryInstance = (): Cloudinary => {
  if (!cloudinaryInstance) {
    cloudinaryInstance = new Cloudinary({
      cloud: {
        cloudName: ENV.CLOUDINARY_CLOUD_NAME,
      },
    });
  }
  return cloudinaryInstance;
};

export const uploadImage = async (
  image: ProductImage,
  productId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  try {
    // Validate environment configuration
    if (!ENV.CLOUDINARY_CLOUD_NAME || !ENV.CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary configuration missing');
    }

    const cld = getCloudinaryInstance();
    const folder = `${ENV.CLOUDINARY_FOLDER}/product-${productId}`;
    const publicId = `${folder}/${image.filename.replace(/\.[^/.]+$/, '')}`;

    return new Promise((resolve) => {
      upload(cld, {
        file: image.uri,
        options: {
          upload_preset: ENV.CLOUDINARY_UPLOAD_PRESET,
          public_id: publicId,
          unsigned: true,
        },
        callback: (error: any, result: any) => {
          if (error) {
            console.error('Upload callback error:', error);
            resolve({
              success: false,
              error: error.message || 'Upload failed',
            });
            return;
          }

          if (result) {
            if (onProgress) {
              // Progress updates happen through the callback
              const progress = result.progress || 100;
              onProgress(Math.round(progress));
            }

            // Check if upload is complete
            if (result.public_id && result.secure_url) {
              resolve({
                success: true,
                publicId: result.public_id,
                secureUrl: result.secure_url,
              });
            }
          }
        },
      });
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

export const uploadMultipleImages = async (
  images: ProductImage[],
  productId: string,
  onProgress?: (imageIndex: number, progress: number) => void
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const result = await uploadImage(image, productId, (progress) => onProgress?.(i, progress));
    results.push(result);
  }

  return results;
};

export const createProductFolder = async (productId: string): Promise<boolean> => {
  // Folders are created automatically when uploading images to Cloudinary
  // This method exists for API compatibility but doesn't need to do anything
  console.log(
    `Product folder will be created automatically: ${ENV.CLOUDINARY_FOLDER}/product-${productId}`
  );
  return true;
};

export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  } = {}
): string => {
  if (!ENV.CLOUDINARY_CLOUD_NAME) {
    console.error('Cloudinary cloud name not configured');
    return '';
  }

  // Construct URL manually for better compatibility
  const baseUrl = `https://res.cloudinary.com/${ENV.CLOUDINARY_CLOUD_NAME}/image/upload`;
  const width = options.width || 400;
  const height = options.height || 400;
  const crop = options.crop || 'fill';
  const quality = options.quality || 'auto:good';

  const transformations = `w_${width},h_${height},c_${crop},q_${quality},f_auto`;

  return `${baseUrl}/${transformations}/${publicId}`;
};
