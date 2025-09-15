# React Native Photo Upload App

A React Native mobile application built with Expo that enables users to capture or select product photos and automatically create Mercado Libre listings through AI-powered image analysis.

## Features

- **Photo Capture & Selection**: Use device camera or photo library to capture product images
- **Intelligent Image Processing**: Automatic image resizing to 1500px for optimal bandwidth usage
- **AI-Powered Analysis**: Backend service analyzes images using Claude API
- **Automated Listings**: Creates Mercado Libre product listings automatically
- **Real-time Status Updates**: Polling service monitors listing creation progress
- **Modern UI**: Clean interface built with NativeWind (Tailwind CSS for React Native)

## Architecture

### Frontend Stack
- **React Native** with Expo framework
- **TypeScript** for type safety
- **NativeWind** for styling (Tailwind CSS variant)
- **expo-image-picker** for photo capture and selection

### Backend Integration
- Direct image upload to backend API
- Real-time status polling with Observer pattern
- Defense-in-depth protection against race conditions

### Image Processing Workflow
1. User captures/selects product photos
2. Images resized to 1500px (larger dimension) for bandwidth optimization
3. Direct upload to backend service
4. Backend analyzes images with Claude API
5. Automated Mercado Libre listing creation
6. Status notifications back to frontend
7. Display listing permalink or error messages

## Project Structure

```
src/
├── App.tsx                     # Main application entry point
├── components/
│   ├── Container.tsx           # SafeAreaView wrapper with consistent styling
│   └── PhotoUploadScreen.tsx       # Main screen layout component
└── services/
    └── productStatusService.ts # Polling service with Observer pattern
```

## Development

### Prerequisites
- Node.js (with pnpm package manager)
- Expo CLI
- React Native development environment

### Installation

```bash
# Install dependencies
pnpm install

# Create environment file
cp .env.example .env
# Edit .env with your backend API credentials
```

### Available Scripts

```bash
# Start development server
pnpm start

# Platform-specific development
pnpm run ios      # iOS simulator
pnpm run android  # Android emulator
pnpm run web      # Web browser

# Code quality
pnpm run lint     # Run ESLint and Prettier checks
pnpm run format   # Auto-fix ESLint issues and format code

# Build
pnpm run prebuild # Generate native code
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Backend URL
BACKEND_API_URL=

# For image upload validation
FRONTEND_API_KEY=
```

### Path Aliases

The project uses path aliases for cleaner imports:
- `@/*` points to `src/*`

## Styling Convention

The app uses NativeWind classes in style objects for consistency:

```typescript
const styles = {
  container: 'flex flex-1 m-6',
  title: 'text-xl font-bold',
  button: 'bg-blue-500 px-4 py-2 rounded'
};
```

## Status Polling Service

The app implements a sophisticated polling service with Observer pattern:

### Key Features
- **Pub/Sub-like API**: Subscribe/unsubscribe interface for status updates
- **5-second polling**: Regular checks to backend status endpoint
- **Auto-cleanup**: Automatic unsubscription on completion
- **Error resilience**: Robust error handling with graceful degradation

### Usage Example
```typescript
import { subscribeToProduct, unsubscribeFromProduct } from '@/services/productStatusService';

// Subscribe to product updates
subscribeToProduct(productId, (payload) => {
  setProduct(payload.product);
  setStatus(payload.status);
  setMessage(payload.message);
});

// Manual cleanup (usually not needed due to auto-unsubscribe)
unsubscribeFromProduct(productId);
```

### Status Flow
- `processing` → Backend is analyzing images and creating listing
- `completed` → Listing successfully created (displays permalink)
- `failed` → Error occurred during processing

## Error Handling & Protection

The app implements multiple layers of protection:

### UI-Level Protection
- Disabled buttons during processing to prevent duplicate submissions
- Reset button only appears after completion
- Single product workflow prevents concurrent operations

### Application-Level Protection
- Product ID validation prevents cross-contamination
- Guards against backend race conditions and delayed responses

### Service-Level Protection
- Automatic cleanup prevents memory leaks
- Comprehensive error handling with graceful degradation
- Network failure recovery

## Backend Integration

### API Endpoints

#### Image Upload
```
POST ${BACKEND_API_URL}/api/image/uploads
```

#### Status Polling
```
GET ${BACKEND_API_URL}/webhook/{productId}/status
```

### Response Format

```typescript
interface PollingPayload {
  productId: string;
  status: 'processing' | 'completed' | 'failed';
  message?: string;
  product?: {
    mercado_libre_listing?: {
      permalink: string;
    };
  };
}
```
