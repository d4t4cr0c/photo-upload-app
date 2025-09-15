# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native photo upload app built with Expo that allows users to capture or select product photos and upload them to the backend app for automated Mercado Libre listing creation. The app uses NativeWind for styling (Tailwind CSS for React Native) and TypeScript for type safety.

## Architecture

- **Frontend**: React Native with Expo framework
- **Styling**: NativeWind (Tailwind CSS variant for React Native)
- **Image Handling**: expo-image-picker for photo capture/selection
- **Cloud Storage**: Cloudinary for image uploads with automatic folder organization (`/app-images/product-${productId}`)
- **Backend Integration**: Webhooks from backend service for listing status updates
- **Backend Service**: Separate ML listings backend that processes images with Claude API and creates Mercado Libre listings

## Key Components

- `src/App.tsx` - Main application entry point
- `src/components/ScreenContent.tsx` - Main screen layout component using NativeWind classes
- `src/components/Container.tsx` - SafeAreaView wrapper with consistent styling
- Path aliases configured with `@/*` pointing to `src/*`

## Development Commands

```bash
# Start development server
pnpm start

# Platform-specific development
pnpm run ios
pnpm run android
pnpm run web

# Code quality
pnpm run lint          # Run ESLint and Prettier checks
pnpm run format        # Auto-fix ESLint issues and format code

# Build
pnpm run prebuild      # Generate native code
```

## Image Upload Workflow

1. User captures/selects product photos using expo-image-picker
2. Images are resized to 1200px (larger dimension) for bandwidth optimization
3. Images uploaded to Cloudinary in organized folders: `/app-images/product-${productId}`
4. Backend service processes images via Claude API
5. Automated Mercado Libre listing creation
6. Webhook notification back to frontend with success/failure status
7. Display listing permalink or error message to user

## Environment Setup

Create `.env` file with Cloudinary credentials (see `.env.example`).

## Styling Convention

Uses NativeWind classes in style objects for consistency:
```typescript
const styles = {
  container: 'flex flex-1 m-6',
  title: 'text-xl font-bold'
};
```