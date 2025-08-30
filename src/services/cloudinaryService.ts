import { ProductImage, UploadResult, BulkUploadOptions } from '@/types';
import { ENV } from '@/config/env';
import { notifyBackendUploadComplete } from '@/services/productStatusService';

export async function uploadImagesWithWebhook(
  images: ProductImage | ProductImage[],
  productId: string,
  options: BulkUploadOptions = {}
): Promise<UploadResult[]> {
  const imageArray = Array.isArray(images) ? images : [images];

  let results: UploadResult[];

  if (imageArray.length === 1) {
    // Single image upload
    const result = await uploadImage(imageArray[0], productId);
    results = [result];
  } else {
    // Multiple image upload
    results = await uploadMultipleImagesBulk(imageArray, productId, options);
  }

  // Send webhook notification - productStatusService handles failures internally
  const success = results.every((r) => r.success);
  const webhookResult = await notifyBackendUploadComplete(productId, results, success);

  // If webhook failed, mark all uploads as failed to trigger proper error handling
  if (webhookResult && !webhookResult.success) {
    return results.map((result) => ({
      ...result,
      success: false,
      error: webhookResult.error || 'Backend notification failed',
    }));
  }

  return results;
}

export async function uploadImage(image: ProductImage, productId: string): Promise<UploadResult> {
  try {
    // Validate environment configuration
    if (!ENV.CLOUDINARY_CLOUD_NAME || !ENV.CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary configuration missing');
    }
    // Cloudinary public_id must include whole path
    // even when specifyin asset_folder property in FormData
    const publicId = `cds-images/product-${productId}/${image.filename.replace(/\.[^/.]+$/, '')}`;

    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', {
      uri: image.uri,
      type: 'image/jpeg',
      name: image.filename,
    } as any);
    formData.append('upload_preset', ENV.CLOUDINARY_UPLOAD_PRESET);
    // Set Cloudinary Asset Folder, otherwise images get uploaded to root folder
    formData.append('asset_folder', 'cds-images');
    // Set Cloudinary Public ID for full image path
    formData.append('public_id', publicId);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${ENV.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.secure_url) {
      console.log('Image uplodad to Cloudinary');

      return {
        success: true,
        publicId: result.public_id,
        secureUrl: result.secure_url,
      };
    } else {
      return {
        success: false,
        error: 'Invalid response from Cloudinary',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Upload error: ${error instanceof Error ? error.message : error}`,
    };
  }
}

export async function uploadMultipleImagesBulk(
  images: ProductImage[],
  productId: string,
  options: BulkUploadOptions = {}
): Promise<UploadResult[]> {
  const { maxConcurrent = 10, onImageComplete } = options;

  if (images.length === 0) {
    return [];
  }

  // Create upload promises for all images
  const uploadPromises = images.map((image, index) => {
    return uploadImage(image, productId)
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
      console.error('🔴 CLOUDINARY - Batch upload error:', error);
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

  return results;
}
