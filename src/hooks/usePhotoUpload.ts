import { useState, useCallback } from 'react';
import { Product, ProductImage, WebhookPayload } from '@/types';
import { capturePhoto, selectFromLibrary } from '@/services/photoService';
import { uploadMultipleImages, uploadMultipleImagesBulk, uploadImagesAuto } from '@/services/cloudinaryService';
import {
  subscribeToProduct,
  unsubscribeFromProduct,
  simulateWebhook,
} from '@/services/webhookService';

// Simple UUID alternative for React Native
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const usePhotoUpload = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [loadingImageCount, setLoadingImageCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<{ [imageId: string]: number }>({});
  const [error, setError] = useState<string | null>(null);

  const createNewProduct = useCallback(() => {
    const newProduct: Product = {
      id: generateId(),
      images: [],
      status: 'pending',
      createdAt: new Date(),
    };
    setProduct(newProduct);
    setError(null);
    return newProduct;
  }, []);

  const addImages = useCallback(
    (images: ProductImage[]) => {
      console.log('🟢 ADD_IMAGES - Called with:', images.length, 'images');
      console.log(
        '🟢 ADD_IMAGES - Current product:',
        product ? `exists (${product.id}, ${product.images.length} images)` : 'null'
      );

      if (!product) {
        console.log('🟢 ADD_IMAGES - No product, returning early');
        return;
      }

      setProduct((prev) => {
        if (prev) {
          const newProduct = {
            ...prev,
            images: [...prev.images, ...images],
          };
          console.log(
            '🟢 ADD_IMAGES - Updating product with',
            newProduct.images.length,
            'total images'
          );
          return newProduct;
        }
        return null;
      });
    },
    [product]
  );

  const removeImage = useCallback(
    (imageId: string) => {
      if (!product) return;

      setProduct((prev) =>
        prev
          ? {
              ...prev,
              images: prev.images.filter((img) => img.id !== imageId),
            }
          : null
      );
    },
    [product]
  );

  const handleCapturePhoto = useCallback(
    async (targetProduct?: Product) => {
      console.log('🟡 HOOK - handleCapturePhoto called');
      const productToUse = targetProduct || product;
      console.log(
        '🟡 HOOK - Using product:',
        productToUse ? `exists (${productToUse.id})` : 'null'
      );

      try {
        setError(null);
        console.log('🟡 HOOK - Calling photoService capturePhoto...');
        const image = await capturePhoto((count) => {
          // This callback is triggered after the camera picker returns with an image
          setIsLoadingImages(true);
          setLoadingImageCount(count);
        });
        console.log('🟡 HOOK - photoService returned:', image ? 'image captured' : 'no image');

        if (image && productToUse) {
          console.log('🟡 HOOK - Adding image to product');
          // If we have a specific product (passed as parameter), update it directly
          if (targetProduct) {
            setProduct((prev) => {
              // Always update to the targetProduct with the new image
              const newProduct = {
                ...targetProduct,
                images: [...targetProduct.images, image],
              };
              console.log(
                '🟡 HOOK - Direct product update with',
                newProduct.images.length,
                'total images'
              );
              return newProduct;
            });
          } else {
            addImages([image]);
          }
        } else {
          console.log('🟡 HOOK - NOT adding image. Reason:', !image ? 'no image' : 'no product');
        }
      } catch (err) {
        console.error('🟡 HOOK - Error in handleCapturePhoto:', err);
        setError(err instanceof Error ? err.message : 'Failed to capture photo');
      } finally {
        setIsLoadingImages(false);
        setLoadingImageCount(0);
      }
    },
    [product, addImages]
  );

  const handleSelectFromLibrary = useCallback(async () => {
    try {
      setError(null);
      const images = await selectFromLibrary((count) => {
        // This callback is triggered after the image library picker returns with images
        setIsLoadingImages(true);
        setLoadingImageCount(count);
      });
      if (images.length > 0 && product) {
        addImages(images);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select photos');
    } finally {
      setIsLoadingImages(false);
      setLoadingImageCount(0);
    }
  }, [product, addImages]);

  const handleWebhookUpdate = useCallback((payload: WebhookPayload) => {
    setProduct((prev) => {
      if (!prev || prev.id !== payload.productId) return prev;

      return {
        ...prev,
        status: payload.status === 'success' ? 'completed' : 'failed',
        mercadoLibreUrl: payload.product?.mercado_libre_listing?.permalink,
        errorMessage: payload.status === 'failed' ? payload.message : undefined,
      };
    });
  }, []);

  const uploadImages = useCallback(async (uploadMode: 'auto' | 'bulk' | 'sequential' = 'auto') => {
    if (!product || product.images.length === 0) return;

    setIsUploading(true);
    setError(null);
    setProduct((prev) => (prev ? { ...prev, status: 'uploading' } : null));

    try {
      let results;
      
      if (uploadMode === 'auto') {
        // Let the service automatically choose the best method
        console.log('🔵 HOOK - Using auto upload mode for', product.images.length, 'images');
        results = await uploadImagesAuto(
          product.images,
          product.id,
          (imageIndex, progress) => {
            const imageId = product.images[imageIndex]?.id;
            if (imageId) {
              setUploadProgress((prev) => ({
                ...prev,
                [imageId]: progress,
              }));
            }
          }
        );
      } else if (uploadMode === 'bulk' && product.images.length > 1) {
        // Use bulk upload for multiple images with better performance
        console.log('🔵 HOOK - Using bulk upload for', product.images.length, 'images');
        results = await uploadMultipleImagesBulk(
          product.images,
          product.id,
          {
            maxConcurrent: 8, // Conservative concurrency to avoid rate limits
            onProgress: (imageIndex, progress) => {
              const imageId = product.images[imageIndex]?.id;
              if (imageId) {
                setUploadProgress((prev) => ({
                  ...prev,
                  [imageId]: progress,
                }));
              }
            },
            onImageComplete: (imageIndex, result) => {
              const imageId = product.images[imageIndex]?.id;
              if (imageId) {
                console.log(`🔵 HOOK - Image ${imageIndex + 1} completed:`, result.success ? 'success' : result.error);
              }
            }
          }
        );
      } else {
        // Use sequential upload for single image or when bulk is disabled
        console.log('🔵 HOOK - Using sequential upload for', product.images.length, 'images');
        results = await uploadMultipleImages(
          product.images,
          product.id,
          (imageIndex, progress) => {
            const imageId = product.images[imageIndex]?.id;
            if (imageId) {
              setUploadProgress((prev) => ({
                ...prev,
                [imageId]: progress,
              }));
            }
          }
        );
      }

      const hasErrors = results.some((result) => !result.success);

      if (hasErrors) {
        const errorCount = results.filter(r => !r.success).length;
        setError(`${errorCount} out of ${results.length} images failed to upload`);
        setProduct((prev) => (prev ? { ...prev, status: 'failed' } : null));
        return;
      }

      setProduct((prev) => (prev ? { ...prev, status: 'processing' } : null));

      subscribeToProduct(product.id, handleWebhookUpdate);

      simulateWebhook(
        product.id,
        true,
        'https://articulo.mercadolibre.com.ar/MLA-123456789-producto-ejemplo'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setProduct((prev) => (prev ? { ...prev, status: 'failed' } : null));
    } finally {
      setIsUploading(false);
    }
  }, [product, handleWebhookUpdate]);

  const reset = useCallback(() => {
    if (product) {
      unsubscribeFromProduct(product.id);
    }
    setProduct(null);
    setIsUploading(false);
    setIsLoadingImages(false);
    setLoadingImageCount(0);
    setUploadProgress({});
    setError(null);
  }, [product]);

  return {
    product,
    isUploading,
    isLoadingImages,
    loadingImageCount,
    uploadProgress,
    error,
    createNewProduct,
    addImages,
    removeImage,
    capturePhoto: handleCapturePhoto,
    selectFromLibrary: handleSelectFromLibrary,
    uploadImages,
    reset,
  };
};
