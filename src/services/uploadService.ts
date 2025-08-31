import { ProductImage, UploadResult, BulkUploadOptions } from '@/types';
import { ENV } from '@/config/env';

export async function uploadImages(
  images: ProductImage | ProductImage[],
  productId: string,
  options: BulkUploadOptions = {}
): Promise<UploadResult[]> {
  const imageArray = Array.isArray(images) ? images : [images];

  try {
    // Validate environment configuration
    if (!ENV.BACKEND_API_URL || !ENV.FRONTEND_API_KEY) {
      throw new Error('Backend configuration missing');
    }

    const formData = new FormData();
    formData.append('productId', productId);

    imageArray.forEach((image) => {
      formData.append('images', {
        uri: image.uri,
        type: 'image/jpeg',
        name: image.filename,
      } as any);
    });

    const response = await fetch(`${ENV.BACKEND_API_URL}/api/image/uploads`, {
      method: 'POST',
      headers: {
        'X-API-Key': ENV.FRONTEND_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await response.json();

    // Return success results for all images
    return imageArray.map(() => ({ success: true }));
  } catch (error) {
    // Return error results for all images
    return imageArray.map(() => ({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }));
  }
}
