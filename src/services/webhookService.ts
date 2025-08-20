import { WebhookPayload } from '@/types';
import { ENV } from '@/config/env';

// Module-level state
const listeners = new Map<string, (payload: WebhookPayload) => void>();
const intervals = new Map<string, NodeJS.Timeout>();

// Notify backend when images upload is complete
export const notifyBackendUploadComplete = async (
  productId: string,
  results: any[],
  success: boolean
) => {
  
  try {
    const payload = {
      productId,
      event: 'images_uploaded',
      success,
      uploadResults: results,
      timestamp: new Date().toISOString(),
    };

    const payloadString = JSON.stringify(payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(`${ENV.BACKEND_API_URL}/webhook/upload`, {
      method: 'POST',
      headers,
      body: payloadString,
    });

    if (response.ok) {
      console.log(`🔵 WEBHOOK - Upload notification sent successfully for product ${productId}`);
    } else {
      throw new Error(`Upload notification failed for product ${productId}: ${response.status}`);
    }
  } catch (error) {
    console.error(`🔵 WEBHOOK - Upload notification error for product ${productId}:`, error);
  }
};

export const subscribeToProduct = (
  productId: string,
  callback: (payload: WebhookPayload) => void
) => {
  console.log(`🔵 POLLING - Starting continuous polling for product ${productId} (every 10 seconds)`);
  listeners.set(productId, callback);
  
  // Start continuous polling every 10 seconds
  const intervalId = setInterval(() => {
    console.log(`🔵 POLLING - Checking status for product ${productId}...`);
    checkProductStatus(productId, callback);
  }, 10000);
  
  // Store the interval ID so we can clear it later
  intervals.set(productId, intervalId);
};

export const unsubscribeFromProduct = (productId: string) => {
  // Clear the polling interval if it exists
  const intervalId = intervals.get(productId);
  if (intervalId) {
    console.log(`🔵 POLLING - Stopping continuous polling for product ${productId}`);
    clearInterval(intervalId);
    intervals.delete(productId);
  }
  
  // Remove the callback
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
        console.log(`🔵 POLLING - Product ${productId} status: ${data.status} - stopping polling`);
        const webhookPayload: WebhookPayload = {
          productId,
          status: data.status === 'completed' ? 'success' : 'failed',
          message: data.message,
          product: data.product,
        };

        callback(webhookPayload);
        unsubscribeFromProduct(productId);
      } else {
        console.log(`🔵 POLLING - Product ${productId} status: ${data.status} - continuing polling`);
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
