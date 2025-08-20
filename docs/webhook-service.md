# Webhook Service Documentation

## Overview

The webhook service manages communication between the React Native app and the backend API for processing uploaded images and creating MercadoLibre listings. It handles both real webhook notifications and simulated responses for development/testing.

## Architecture

### Core Components

1. **Upload Notification**: Notifies backend when image uploads are complete
2. **Status Polling**: Continuously checks backend for processing status updates
3. **Webhook Simulation**: Provides mock responses for development/testing
4. **Listener Management**: Manages callbacks for status updates

## API Functions

### `notifyBackendUploadComplete(productId, results, success)`

Sends a POST request to the backend when image uploads finish.

**Parameters:**
- `productId` (string): Unique identifier for the product
- `results` (array): Array of upload results from Cloudinary
- `success` (boolean): Whether all uploads succeeded

**Endpoint:** `POST ${BACKEND_API_URL}/webhook/upload`

**Payload:**
```json
{
  "productId": "abc123",
  "event": "images_uploaded",
  "success": true,
  "uploadResults": [...],
  "timestamp": "2025-08-20T10:30:00.000Z"
}
```

**Error Handling:**
- Throws error for HTTP failures (4xx, 5xx status codes)
- Catches and logs network errors
- Non-blocking - app continues if notification fails

### `subscribeToProduct(productId, callback)`

Starts continuous polling for product status updates.

**Parameters:**
- `productId` (string): Product to monitor
- `callback` (function): Called when status changes

**Behavior:**
- Polls every 10 seconds using `setInterval`
- Stores callback and interval ID for cleanup
- Automatically unsubscribes when status is 'completed' or 'failed'

**Endpoint:** `GET ${BACKEND_API_URL}/webhook/${productId}/status`

### `unsubscribeFromProduct(productId)`

Stops polling and removes listeners for a product.

**Actions:**
- Clears the polling interval
- Removes callback from listeners map
- Should be called on component unmount or reset

### `checkProductStatus(productId, callback)`

Internal function that polls the backend for status updates.

**Response Handling:**
- `completed`/`failed`: Triggers callback and stops polling
- `processing`: Continues polling
- HTTP errors: Triggers error callback and stops polling
- Network errors: Triggers error callback and stops polling

**Webhook Payload Format:**
```typescript
interface WebhookPayload {
  productId: string;
  status: 'success' | 'failed';
  message?: string;
  product?: {
    mercado_libre_listing?: {
      permalink: string;
    };
  };
}
```

### `simulateWebhook(productId, success, permalink)`

Simulates a backend webhook response for development/testing.

**Parameters:**
- `productId` (string): Product being processed
- `success` (boolean): Whether to simulate success or failure
- `permalink` (string, optional): Mock MercadoLibre URL

**Behavior:**
- Waits 3 seconds to simulate processing time
- Triggers the registered callback with mock data
- Automatically unsubscribes after triggering

## Usage Flow

### 1. Image Upload Complete

```typescript
// After images upload to Cloudinary
await notifyBackendUploadComplete(productId, uploadResults, allSuccessful);
```

### 2. Start Monitoring

```typescript
// Start polling for status updates
subscribeToProduct(productId, (payload) => {
  // Update UI based on payload.status
  setProduct(prev => ({
    ...prev,
    status: payload.status === 'success' ? 'completed' : 'failed',
    mercadoLibreUrl: payload.product?.mercado_libre_listing?.permalink
  }));
});
```

### 3. Cleanup

```typescript
// Stop polling when component unmounts or resets
unsubscribeFromProduct(productId);
```

## Development vs Production

### Development Mode

Uses `simulateWebhook()` to mock backend responses:

```typescript
// Simulate successful completion with mock URL
simulateWebhook(
  productId, 
  true, 
  'https://articulo.mercadolibre.com.ar/MLA-123456789-producto-ejemplo'
);
```

### Production Mode

Relies on real backend webhook notifications:
- Backend processes images and creates MercadoLibre listing
- Backend sends webhook to update product status
- App polls for status until completion

## Error Handling

### Network Errors
- Logged to console with product context
- User sees generic error message
- App remains functional

### HTTP Errors
- 4xx/5xx responses throw specific errors
- Polling stops to prevent spam
- Error callback triggered with details

### Timeout Handling
- No explicit timeout on polling
- Continues until explicit completion/failure
- Manual cleanup required via `unsubscribeFromProduct()`

## State Management

### Module-Level State

```typescript
// Callback functions for each product
const listeners = new Map<string, (payload: WebhookPayload) => void>();

// Polling intervals for cleanup
const intervals = new Map<string, NodeJS.Timeout>();
```

### Cleanup Considerations

- Always call `unsubscribeFromProduct()` on component unmount
- Clear all listeners if needed with `clearAllListeners()`
- Prevent memory leaks from abandoned intervals

## Configuration

### Environment Variables

- `BACKEND_API_URL`: Base URL for webhook endpoints
- Should be configured in `@/config/env`

### Polling Intervals

- Status polling: 10 seconds
- Simulation delay: 3 seconds
- Backend processing timeout: 20 seconds (configurable)

## Testing

### Unit Testing
- Mock fetch requests for API calls
- Test error handling scenarios
- Verify cleanup behavior

### Integration Testing
- Use `simulateWebhook()` for end-to-end flows
- Test with various success/failure scenarios
- Verify UI updates correctly

## Future Improvements

1. **WebSocket Support**: Replace polling with real-time updates
2. **Exponential Backoff**: Reduce polling frequency over time
3. **Retry Logic**: Automatic retry for failed notifications
4. **Offline Support**: Queue notifications when offline
5. **Progress Tracking**: More granular status updates
