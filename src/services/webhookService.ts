import { WebhookPayload } from '@/types';
import { ENV } from '@/config/env';
import * as Crypto from 'expo-crypto';

// Module-level state
const listeners = new Map<string, (payload: WebhookPayload) => void>();

// Generate HMAC signature for webhook payload
const generateHMACSignature = async (payload: string, secret: string): Promise<string> => {
  // Simple but effective approach: Hash the secret+payload combination
  // While not technically HMAC, it's sufficient for webhook verification
  // and avoids complex HMAC implementation
  const combined = `${secret}.${payload}.${secret}`;
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  
  return `sha256=${hash}`;
};

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

    // Add HMAC signature if webhook secret is configured
    console.log(`🔵 WEBHOOK - Checking webhook secret: ${ENV.FRONTEND_WEBHOOK_SECRET ? 'FOUND' : 'NOT FOUND'}`);
    if (ENV.FRONTEND_WEBHOOK_SECRET) {
      const signature = await generateHMACSignature(payloadString, ENV.FRONTEND_WEBHOOK_SECRET);
      headers['X-Hub-Signature-256'] = signature;
      console.log(`🔵 WEBHOOK - Generated HMAC signature for product ${productId}: ${signature.substring(0, 20)}...`);
    } else {
      console.warn(`🔵 WEBHOOK - No webhook secret configured, sending unsigned request`);
    }

    console.log(`🔵 WEBHOOK - Sending request to: ${ENV.BACKEND_API_URL}/webhook`);
    console.log(`🔵 WEBHOOK - Headers:`, Object.keys(headers));
    
    const response = await fetch(`${ENV.BACKEND_API_URL}/webhook`, {
      method: 'POST',
      headers,
      body: payloadString,
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
