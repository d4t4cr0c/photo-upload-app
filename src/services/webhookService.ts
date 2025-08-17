import { WebhookPayload } from '@/types';

// Module-level state
const listeners = new Map<string, (payload: WebhookPayload) => void>();
let isListening = false;

export const subscribeToProduct = (
  productId: string,
  callback: (payload: WebhookPayload) => void
) => {
  listeners.set(productId, callback);
  startListening();
};

export const unsubscribeFromProduct = (productId: string) => {
  listeners.delete(productId);
  if (listeners.size === 0) {
    stopListening();
  }
};

const startListening = () => {
  if (isListening) return;

  isListening = true;
  pollForUpdates();
};

const stopListening = () => {
  isListening = false;
};

const pollForUpdates = async () => {
  if (!isListening) return;

  try {
    for (const [productId, callback] of listeners.entries()) {
      await checkProductStatus(productId, callback);
    }
  } catch (error) {
    console.error('Error polling for updates:', error);
  }

  if (isListening) {
    setTimeout(() => pollForUpdates(), 5000);
  }
};

const checkProductStatus = async (
  productId: string,
  callback: (payload: WebhookPayload) => void
) => {
  try {
    const response = await fetch(`/api/products/${productId}/status`);

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
    }
  } catch (error) {
    console.error(`Error checking status for product ${productId}:`, error);
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
  stopListening();
};
