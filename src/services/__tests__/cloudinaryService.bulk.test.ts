import { uploadMultipleImagesBulk, uploadImagesAuto } from '../cloudinaryService';
import { ProductImage } from '@/types';

// Mock the cloudinary-react-native module
jest.mock('cloudinary-react-native', () => ({
  upload: jest.fn(),
}));

// Mock the Cloudinary URL generator
jest.mock('@cloudinary/url-gen', () => ({
  Cloudinary: jest.fn().mockImplementation(() => ({})),
}));

// Mock environment config
jest.mock('@/config/env', () => ({
  ENV: {
    CLOUDINARY_CLOUD_NAME: 'test-cloud',
    CLOUDINARY_UPLOAD_PRESET: 'test-preset',
    CLOUDINARY_FOLDER: 'test-folder',
  },
}));

const mockUpload = require('cloudinary-react-native').upload as jest.Mock;

describe('Cloudinary Bulk Upload', () => {
  const mockImages: ProductImage[] = [
    {
      id: '1',
      uri: 'file://test1.jpg',
      filename: 'test1.jpg',
    },
    {
      id: '2', 
      uri: 'file://test2.jpg',
      filename: 'test2.jpg',
    },
    {
      id: '3',
      uri: 'file://test3.jpg', 
      filename: 'test3.jpg',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpload.mockImplementation((cloudinary, options) => {
      // Simulate successful upload
      setTimeout(() => {
        options.callback(null, {
          public_id: `test-folder/product-test123/${options.options.public_id}`,
          secure_url: `https://res.cloudinary.com/test-cloud/image/upload/test-folder/product-test123/${options.options.public_id}`,
          original_filename: options.file.split('/').pop(),
          progress: 100,
        });
      }, 100);
    });
  });

  describe('uploadMultipleImagesBulk', () => {
    it('should upload multiple images in parallel', async () => {
      const results = await uploadMultipleImagesBulk(mockImages, 'test123', {
        maxConcurrent: 2,
      });

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.publicId).toBeDefined();
        expect(result.secureUrl).toBeDefined();
      });

      // Verify that all uploads were called
      expect(mockUpload).toHaveBeenCalledTimes(3);
    });

    it('should handle progress callbacks', async () => {
      const progressCallback = jest.fn();
      const completeCallback = jest.fn();

      await uploadMultipleImagesBulk(mockImages, 'test123', {
        maxConcurrent: 2,
        onProgress: progressCallback,
        onImageComplete: completeCallback,
      });

      expect(completeCallback).toHaveBeenCalledTimes(3);
      expect(completeCallback).toHaveBeenCalledWith(0, expect.objectContaining({ success: true }));
      expect(completeCallback).toHaveBeenCalledWith(1, expect.objectContaining({ success: true }));
      expect(completeCallback).toHaveBeenCalledWith(2, expect.objectContaining({ success: true }));
    });

    it('should handle empty array', async () => {
      const results = await uploadMultipleImagesBulk([], 'test123');
      expect(results).toHaveLength(0);
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('should handle upload failures gracefully', async () => {
      mockUpload.mockImplementation((cloudinary, options) => {
        setTimeout(() => {
          options.callback(new Error('Upload failed'), null);
        }, 100);
      });

      const results = await uploadMultipleImagesBulk(mockImages, 'test123');

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('uploadImagesAuto', () => {
    it('should use bulk upload for multiple images', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const results = await uploadImagesAuto(mockImages, 'test123');

      expect(results).toHaveLength(3);
      expect(consoleSpy).toHaveBeenCalledWith('🔵 CLOUDINARY - Auto-selecting bulk upload for 3 images');
      
      consoleSpy.mockRestore();
    });

    it('should use sequential upload for single image', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const singleImage = [mockImages[0]];
      const results = await uploadImagesAuto(singleImage, 'test123');

      expect(results).toHaveLength(1);
      expect(consoleSpy).toHaveBeenCalledWith('🔵 CLOUDINARY - Auto-selecting sequential upload for single image');
      
      consoleSpy.mockRestore();
    });
  });
});
