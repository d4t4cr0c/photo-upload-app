import { WebhookPayload } from '@/types';
import { ENV } from '@/config/env';

// Module-level state
const listeners = new Map<string, (payload: WebhookPayload) => void>();

// Notify backend when images upload is complete
export const notifyBackendUploadComplete = async (
  productId: string,
  results: any[],
  success: boolean
) => {
  try {
    const response = await fetch(`${ENV.BACKEND_API_URL}/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        event: 'images_uploaded',
        success,
        uploadResults: results,
        timestamp: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      console.log(`🔵 WEBHOOK - Upload notification sent successfully for product ${productId}`);
    } else {
      console.warn(`🔵 WEBHOOK - Upload notification failed for product ${productId}: ${response.status}`);
    }
  } catch (error) {
    console.error(`🔵 WEBHOOK - Upload notification error for product ${productId}:`, error);
  }
};

export const subscribeToProduct = (
  productId: string,
  callback: (payload: WebhookPayload) => void
) => {
  listeners.set(productId, callback);
  
  // Schedule a single check after 30 seconds
  setTimeout(() => {
    checkProductStatus(productId, callback);
  }, 30000);
};

export const unsubscribeFromProduct = (productId: string) => {
  listeners.delete(productId);
};

const checkProductStatus = async (
  productId: string,
  callback: (payload: WebhookPayload) => void
) => {
  try {
    const response = await fetch(`${ENV.BACKEND_API_URL}/webhook/${productId}/status`);

    if (response.ok) {
      const data = await response.json();

      if (data.status === 'completed' || data.status === 'failed') {
        const webhookPayload: WebhookPayload = {
          productId,
          status: data.status === 'completed' ? 'success' : 'failed',
          message: data.message,
          product: data.product,
        };

        callback(webhookPayload);
        unsubscribeFromProduct(productId);
      }
    } else {
      // Show error if API request fails
      const errorPayload: WebhookPayload = {
        productId,
        status: 'failed',
        message: `Failed to check product status: ${response.status} ${response.statusText}`,
      };
      callback(errorPayload);
      unsubscribeFromProduct(productId);
    }
  } catch (error) {
    console.error(`Error checking status for product ${productId}:`, error);
    
    // Show error if request fails
    const errorPayload: WebhookPayload = {
      productId,
      status: 'failed',
      message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
    callback(errorPayload);
    unsubscribeFromProduct(productId);
  }
};

export const simulateWebhook = async (
  productId: string,
  success: boolean = true,
  permalink?: string
) => {
  const callback = listeners.get(productId);
  if (!callback) return;

  const payload: WebhookPayload = {
    productId,
    status: success ? 'success' : 'failed',
    message: success ? 'Listing created successfully' : 'Failed to create listing',
    product:
      success && permalink
        ? {
            mercado_libre_listing: {
              permalink,
            },
          }
        : undefined,
  };

  setTimeout(() => {
    callback(payload);
    unsubscribeFromProduct(productId);
  }, 3000);
};

export const processIncomingWebhook = (payload: WebhookPayload) => {
  const callback = listeners.get(payload.productId);
  if (callback) {
    callback(payload);
    unsubscribeFromProduct(payload.productId);
  }
};

export const clearAllListeners = () => {
  listeners.clear();
};
