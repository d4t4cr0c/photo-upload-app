import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Product, ProductImage, WebhookPayload } from '@/types';
import { capturePhoto, selectFromLibrary } from '@/services/photoService';
import { uploadMultipleImages } from '@/services/cloudinaryService';
import {
  subscribeToProduct,
  unsubscribeFromProduct,
  simulateWebhook,
} from '@/services/webhookService';

export const usePhotoUpload = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [imageId: string]: number }>({});
  const [error, setError] = useState<string | null>(null);

  const createNewProduct = useCallback(() => {
    const newProduct: Product = {
      id: uuidv4(),
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
      if (!product) return;

      setProduct((prev) =>
        prev
          ? {
              ...prev,
              images: [...prev.images, ...images],
            }
          : null
      );
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

  const handleCapturePhoto = useCallback(async () => {
    try {
      setError(null);
      const image = await capturePhoto();
      if (image && product) {
        addImages([image]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to capture photo');
    }
  }, [product, addImages]);

  const handleSelectFromLibrary = useCallback(async () => {
    try {
      setError(null);
      const images = await selectFromLibrary();
      if (images.length > 0 && product) {
        addImages(images);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select photos');
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

  const uploadImages = useCallback(async () => {
    if (!product || product.images.length === 0) return;

    setIsUploading(true);
    setError(null);
    setProduct((prev) => (prev ? { ...prev, status: 'uploading' } : null));

    try {
      const results = await uploadMultipleImages(
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

      const hasErrors = results.some((result) => !result.success);

      if (hasErrors) {
        setError('Some images failed to upload');
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
    setUploadProgress({});
    setError(null);
  }, [product]);

  return {
    product,
    isUploading,
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
