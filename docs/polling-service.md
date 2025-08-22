# Polling Service Architecture

## Overview

The `productStatusService.ts` implements a **Polling Service with Observer Pattern** that provides a Pub/Sub-like API for monitoring product status updates. The service uses active polling to check backend status every 5 seconds while also handling webhook notifications for upload completion.

## Architecture Pattern

### Pub/Sub-like Elements

The service implements several characteristics of the Publish-Subscribe pattern:

1. **Subscribe/Unsubscribe Interface**:
   - `subscribeToProduct(productId, callback)` - Register for status updates
   - `unsubscribeFromProduct(productId)` - Stop receiving updates
   - Callback-based notification system

2. **Decoupled Communication**:
   - Components don't need to know about polling implementation details
   - Service maintains internal registry of listeners
   - Clean separation between data fetching and UI updates

3. **Event-driven Updates**:
   - Status changes automatically trigger registered callbacks
   - Supports multiple subscribers per product (theoretically)

### Key Differences from True Pub/Sub

1. **No Message Broker**: Direct polling implementation without central event bus
2. **Pull vs Push**: Active polling (pull-based) rather than pushed notifications
3. **One-to-One Mapping**: Each productId maps to exactly one listener
4. **No Topic Abstraction**: Direct productId subscription instead of topic-based channels

## Implementation Details

### Core Components

```typescript
// Module-level state management
const listeners = new Map<string, (payload: PollingPayload) => void>();
const intervals = new Map<string, NodeJS.Timeout>();
```

### Polling Mechanism

- **Interval**: 5-second polling cycle
- **Endpoint**: `GET /webhook/{productId}/status`
- **Auto-cleanup**: Stops polling when status reaches `completed` or `failed`
- **Error Handling**: Network failures trigger `failed` status with cleanup

### Status Flow

1. **Subscription**: Component calls `subscribeToProduct()`
2. **Polling Start**: Service begins 5-second interval checks
3. **Status Updates**: Each poll result triggers callback with `PollingPayload`
4. **Auto-unsubscribe**: Polling stops on final status (`completed`/`failed`)

## Usage Pattern

```typescript
// Subscribe to product updates
subscribeToProduct(productId, (payload) => {
  setProduct(payload.product);
  setStatus(payload.status);
  setMessage(payload.message);
});

// Manual cleanup (usually not needed due to auto-unsubscribe)
unsubscribeFromProduct(productId);
```

## Data Types

### PollingPayload
```typescript
interface PollingPayload {
  productId: string;
  status: 'processing' | 'completed' | 'failed';
  message?: string;
  product?: any;
}
```

## Error Handling

The service implements comprehensive error handling:

- **HTTP Errors**: Non-2xx responses throw errors caught by unified error handler
- **Network Issues**: Connection failures trigger `failed` status
- **JSON Parsing**: Malformed responses handled gracefully
- **Automatic Cleanup**: All errors result in polling termination

## Webhook Integration

The service also handles true webhook notifications:

### Upload Notifications
```typescript
notifyBackendUploadComplete(productId, results, success)
```

Sends POST request to `/webhook/upload` when image uploads complete, allowing backend to begin processing.

## Benefits

1. **Simple API**: Subscribe/unsubscribe pattern familiar to developers
2. **Automatic Cleanup**: No memory leaks from forgotten subscriptions
3. **Error Resilience**: Robust error handling with graceful degradation
4. **Consistent Interface**: Same callback pattern regardless of success/failure

## Limitations

1. **Polling Overhead**: 5-second intervals create constant network traffic
2. **Not Real-time**: Up to 5-second delay for status updates
3. **Single Listener**: One callback per productId (though easily extensible)
4. **Resource Usage**: Continuous intervals consume device resources

## Future Considerations

### Potential Improvements

1. **WebSocket Integration**: Replace polling with real-time WebSocket connections
2. **Multiple Listeners**: Support multiple callbacks per productId
3. **Topic-based Subscriptions**: Abstract productId into topic/channel system
4. **Adaptive Polling**: Reduce frequency only after extended periods (e.g., after 2+ minutes)

### Migration Path

The current Observer-based API would translate well to true Pub/Sub:

```typescript
// Current
subscribeToProduct(productId, callback);

// Future WebSocket/EventSource
subscribe(`product.${productId}.status`, callback);
```
