import { Cloudinary } from '@cloudinary/url-gen';
import { upload } from 'cloudinary-react-native';
import { ProductImage, UploadResult, BulkUploadOptions } from '@/types';
import { ENV } from '@/config/env';
import { notifyBackendUploadComplete } from '@/services/webhookService';

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
        callback: (error: any, response: any) => {
          if (error) {
            return resolve({
              success: false,
              error: `Upload error: ${error.message || error}`,
            });
          }

          if (response && response.secure_url) {
            if (onProgress) {
              onProgress(image.id, 100);
            }

            const publicImageUrl = response.secure_url;
            resolve({
              success: true,
              cloudinaryImageId: response.public_id,
              publicImageUrl,
            });
          } else {
            resolve({
              success: false,
              error: 'Invalid response from Cloudinary',
            });
          }
        },
      });
    });
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error}`);
  }
}
};

export const uploadMultipleImagesBulk = async (
  images: ProductImage[],
  productId: string,
  options: BulkUploadOptions = {}
): Promise<UploadResult[]> => {
  const { maxConcurrent = 10, onProgress, onImageComplete } = options;
  
  if (images.length === 0) {
    return [];
  }

  // Create upload promises for all images
  const uploadPromises = images.map((image, index) => {
    return uploadImage(image, productId, (progress) => onProgress?.(index, progress))
      .then((result) => {
        onImageComplete?.(index, result);
        return { index, result };
      })
      .catch((error) => {
        const errorResult: UploadResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed',
        };
        onImageComplete?.(index, errorResult);
        return { index, result: errorResult };
      });
  });

  // Process uploads in batches to respect concurrency limits
  const results: UploadResult[] = new Array(images.length);
  const batchSize = Math.min(maxConcurrent, images.length);
  
  for (let i = 0; i < uploadPromises.length; i += batchSize) {
    const batch = uploadPromises.slice(i, i + batchSize);
    
    try {
      const batchResults = await Promise.all(batch);
      
      // Place results in correct order
      batchResults.forEach(({ index, result }) => {
        results[index] = result;
      });
    } catch (error) {
      // Handle any unexpected errors by filling remaining slots with error results
      batch.forEach((_, batchIndex) => {
        const globalIndex = i + batchIndex;
        if (!results[globalIndex]) {
          results[globalIndex] = {
            success: false,
            error: 'Batch upload failed',
          };
        }
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;
  
  return results;
};

// Enhanced upload functions with webhook notifications
export const uploadImageWithWebhook = async (
  image: ProductImage,
  productId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  const result = await uploadImage(image, productId, onProgress);
  
  // Send webhook notification
  await notifyBackendUploadComplete(productId, [result], result.success);
  
  return result;
};

export const uploadMultipleImagesBulkWithWebhook = async (
  images: ProductImage[],
  productId: string,
  options: BulkUploadOptions = {}
): Promise<UploadResult[]> => {
  const results = await uploadMultipleImagesBulk(images, productId, options);
  
  // Send webhook notification
  const success = results.every(r => r.success);
  await notifyBackendUploadComplete(productId, results, success);
  
  return results;
};

export const createProductFolder = async (productId: string): Promise<boolean> => {
  // Folders are created automatically when uploading images to Cloudinary
  // This method exists for API compatibility but doesn't need to do anything
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
