# Cloudinary Bulk Upload Implementation

This document explains the new bulk upload functionality for multiple images in the photo upload app.

## Overview

The app now supports three different upload modes for better performance when uploading multiple images:

1. **Auto Mode** (Default): Automatically chooses the best upload method
2. **Bulk Mode**: Upload multiple images in parallel for better performance
3. **Sequential Mode**: Upload images one by one (original behavior)

## Key Benefits

- **Improved Performance**: Multiple images are uploaded in parallel instead of sequentially
- **Better User Experience**: Faster uploads with real-time progress tracking per image
- **Rate Limit Handling**: Configurable concurrency to avoid Cloudinary rate limits
- **Backward Compatibility**: Existing code continues to work unchanged

## Implementation Details

### New Functions

#### `uploadMultipleImagesBulk()`
```typescript
uploadMultipleImagesBulk(
  images: ProductImage[],
  productId: string,
  options: BulkUploadOptions = {}
): Promise<UploadResult[]>
```

Options:
- `maxConcurrent`: Maximum number of concurrent uploads (default: 10)
- `onProgress`: Progress callback for individual images
- `onImageComplete`: Callback when each image upload completes

#### `uploadImagesAuto()`
```typescript
uploadImagesAuto(
  images: ProductImage[],
  productId: string,
  onProgress?: (imageIndex: number, progress: number) => void
): Promise<UploadResult[]>
```

Automatically chooses:
- Bulk upload for multiple images (2+)
- Sequential upload for single images

### Hook Usage

The `usePhotoUpload` hook now supports different upload modes:

```typescript
const { uploadImages } = usePhotoUpload();

// Auto mode (recommended)
await uploadImages('auto');

// Explicit bulk mode
await uploadImages('bulk');

// Sequential mode
await uploadImages('sequential');
```

## Performance Improvements

Based on Cloudinary's documentation, the bulk upload approach provides:

- **Parallel Processing**: Multiple uploads happen simultaneously
- **Configurable Concurrency**: Start with ~10 concurrent requests, adjustable based on needs
- **Error Handling**: Individual image failures don't stop other uploads
- **Progress Tracking**: Real-time progress for each image

## Best Practices

1. **Use Auto Mode**: Let the system choose the best upload method
2. **Monitor Rate Limits**: If you receive HTTP 420 errors, reduce `maxConcurrent`
3. **Handle Partial Failures**: Check individual results for failed uploads
4. **Progress Feedback**: Use progress callbacks for better UX

## Example Usage

```typescript
// In a component
const { uploadImages, uploadProgress } = usePhotoUpload();

const handleUpload = async () => {
  try {
    await uploadImages('auto'); // Uses bulk upload for multiple images
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Progress tracking
{Object.entries(uploadProgress).map(([imageId, progress]) => (
  <ProgressBar key={imageId} progress={progress} />
))}
```

## Testing

The implementation includes comprehensive tests covering:
- Parallel upload functionality
- Progress callbacks
- Error handling
- Auto mode selection
- Empty array handling

Run tests with:
```bash
npm test cloudinaryService.bulk.test.ts
```

## Configuration

Default settings are optimized for most use cases:
- Max concurrent uploads: 8-10 (conservative to avoid rate limits)
- Auto mode: Enabled by default
- Progress tracking: Real-time per image

These can be adjusted based on your specific needs and Cloudinary account limits.
