import { PollingPayload } from '@/types';
import { ENV } from '@/config/env';

// Module-level state
const listeners = new Map<string, (payload: PollingPayload) => void>();
const intervals = new Map<string, NodeJS.Timeout>();

// Notify backend when images upload is complete (webhook)
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
  callback: (payload: PollingPayload) => void
) => {
  console.log(`🔵 POLLING - Starting continuous polling for product ${productId} (every 5 seconds)`);
  listeners.set(productId, callback);
  
  // Start continuous polling every 5 seconds
  const intervalId = setInterval(() => {
    console.log(`🔵 POLLING - Checking status for product ${productId}...`);
    checkProductStatus(productId, callback);
  }, 5000);
  
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




// POLL backend every 5 seconds to check product listing status
const checkProductStatus = async (
  productId: string,
  callback: (payload: PollingPayload) => void
) => {
  try {
    const response = await fetch(`${ENV.BACKEND_API_URL}/webhook/${productId}/status`);

    if (response.ok) {

      const data = await response.json();

      const webhookPayload: PollingPayload = {
        productId,
        status: data.status,
        message: data.message,
        product: data.product,
      };

      callback(webhookPayload);

      // Only stop polling when processing is actually finished
      if (data.status === 'completed' || data.status === 'failed') {
        console.log(`🔵 POLLING - Product ${productId} status: ${data.status} - stopping polling`);
        unsubscribeFromProduct(productId);
      } else {
        console.log(`🔵 POLLING - Product ${productId} status: ${data.status} - continuing polling`);
      }

    } else {
      // Throw error for non-2xx status codes, will be caught below
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`🔵 POLLING - Error checking status for product ${productId}:`, error);
    
    // Handle all errors (network issues, HTTP errors, JSON parsing errors, etc.)
    const errorPayload: PollingPayload = {
      productId,
      status: 'failed',
      message: `Error checking status: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
    callback(errorPayload);
    unsubscribeFromProduct(productId);
  }
};
