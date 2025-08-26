import { useState, useCallback } from 'react';
import { Product, ProductImage, PollingPayload } from '@/types';
import { capturePhoto, selectFromLibrary } from '@/services/photoService';
import { uploadImagesWithWebhook } from '@/services/cloudinaryService';
import { subscribeToProduct, unsubscribeFromProduct } from '@/services/productStatusService';

// Simple UUID alternative for React Native
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// CUSTOM HOOK
export const usePhotoUpload = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [loadingImageCount, setLoadingImageCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createNewProduct = useCallback(() => {
    const newProduct: Product = {
      id: generateId(),
      images: [],
      status: 'pending',
      createdAt: new Date(),
    };

    setProduct(newProduct);
    return newProduct;
  }, []);

  const addImages = useCallback(
    (images: ProductImage[]) => {
      if (!product) {
        return;
      }

      setProduct((currentProduct) => {
        if (currentProduct) {
          const newProduct = {
            ...currentProduct,
            images: [...currentProduct.images, ...images],
          };

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

      setProduct((currentProduct) =>
        currentProduct
          ? {
              ...currentProduct,
              images: currentProduct.images.filter((img) => img.id !== imageId),
            }
          : null
      );
    },
    [product]
  );

  // TAKE PHOTO
  const handleCapturePhoto = useCallback(
    async (targetProduct?: Product) => {
      const productToUse = targetProduct || product;

      try {
        const image = await capturePhoto(
          // Callback passed to show skeleton while processing: onStartProcessing
          () => {
            // Show loading state only when we start processing the image (after capture)
            setIsLoadingImages(true);
            setLoadingImageCount(1);
          }
        );

        if (image && productToUse) {
          // If we have a specific product (passed as parameter), update it directly
          if (targetProduct) {
            setProduct(() => {
              // Always update to the targetProduct with the new image
              const newProduct = {
                ...targetProduct,
                images: [...targetProduct.images, image],
              };

              return newProduct;
            });
          } else {
            addImages([image]);
          }
        }
      } catch (err) {
        console.error('🟡 HOOK - Error in handleCapturePhoto:', err);
        setErrorMsg('Error al tomar foto. Intente nuevamente.');
      } finally {
        // Finally stop showing skeletons
        setIsLoadingImages(false);
        setLoadingImageCount(0);
      }
    },
    [product, addImages]
  );

  // SELECT FROM PHOTO LIBRARY
  const handleSelectFromLibrary = useCallback(
    async (targetProduct?: Product) => {
      const productToUse = targetProduct || product;

      try {
        const images = await selectFromLibrary(
          // Callback passed to start showing skeleton while processing: onStartProcessing
          (count: number) => {
            setIsLoadingImages(true);
            setLoadingImageCount(count);
          }
        );

        if (images.length > 0) {
          if (productToUse) {
            // If we have a specific product (passed as parameter), update it directly
            if (targetProduct) {
              setProduct(() => {
                // Always update to the targetProduct with the new images
                const newProduct = {
                  ...targetProduct,
                  images: [...targetProduct.images, ...images],
                };

                return newProduct;
              });
            } else {
              addImages(images);
            }
          }
        } else {
          console.log('🟢 HOOK - NOT adding images. Reason: no images selected');
        }
      } catch (err) {
        console.error('🟢 HOOK - Error in handleSelectFromLibrary:', err);
        setErrorMsg('Error al seleccionar fotos. Intente nuevamente.');
      } finally {
        // Finally stop showing skeleton for images
        setIsLoadingImages(false);
        setLoadingImageCount(0);
      }
    },
    [product, addImages]
  );

  // POLLING UPDATE
  const handlePollingUpdate = useCallback((payload: PollingPayload) => {
    setProduct((currentProduct) => {
      // Fail safely is product is null
      // Or product ID doesn't match the ID sent by the backend
      if (!currentProduct || currentProduct.id !== payload.productId) return currentProduct;

      return {
        ...currentProduct,
        status: payload.status, // Use the status directly from backend
        mercadoLibreUrl: payload.product?.mercado_libre_listing?.permalink,
        errorMessage: payload.status === 'failed' ? payload.message : undefined,
      };
    });
  }, []);

  // UPLOAD IMAGES TO CLOUDINARY
  const uploadImages = useCallback(async () => {
    if (!product || product.images.length === 0) return;

    setIsUploading(true);
    setProduct((currentProduct) =>
      currentProduct ? { ...currentProduct, status: 'uploading' } : null
    );

    try {
      const results = await uploadImagesWithWebhook(product.images, product.id, {
        maxConcurrent: 8, // Conservative concurrency to avoid rate limits
      });

      const hasErrors = results.some((result: any) => !result.success);

      if (hasErrors) {
        setProduct((currentProduct) =>
          currentProduct ? { ...currentProduct, status: 'failed' } : null
        );
        return;
      }

      // Set to 'waiting' to show appropriate message to user while waiting
      setProduct((currentProduct) =>
        currentProduct ? { ...currentProduct, status: 'waiting' } : null
      );

      // Wait 5 seconds, change status to 'processing'
      setTimeout(() => {
        setProduct((currentProduct) =>
          currentProduct ? { ...currentProduct, status: 'processing' } : null
        );
      }, 5000);

      // Wait another 5 seconds before starting to poll, giving backend time to process
      setTimeout(() => {
        subscribeToProduct(product.id, handlePollingUpdate);
      }, 5000);
    } catch (err) {
      console.error('🔴 HOOK - Error in uploadImages:', err);
      setErrorMsg('Error al cargar fotos. Intente nuevamente.');
      setProduct((currentProduct) =>
        currentProduct ? { ...currentProduct, status: 'failed' } : null
      );
    } finally {
      setIsUploading(false);
    }
  }, [product, handlePollingUpdate]);

  // RESET
  const reset = useCallback(() => {
    if (product) {
      unsubscribeFromProduct(product.id);
    }
    setProduct(null);
    setIsUploading(false);
    setIsLoadingImages(false);
    setLoadingImageCount(0);
    setErrorMsg(null);
  }, [product]);

  return {
    product,
    isUploading,
    isLoadingImages,
    loadingImageCount,
    createNewProduct,
    addImages,
    removeImage,
    capturePhoto: handleCapturePhoto,
    selectFromLibrary: handleSelectFromLibrary,
    uploadImages,
    reset,
    errorMsg,
  };
};
