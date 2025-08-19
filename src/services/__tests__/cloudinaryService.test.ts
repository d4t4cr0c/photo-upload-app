import { getOptimizedImageUrl, createProductFolder } from '../cloudinaryService';

// Mock the environment config directly
jest.mock('../../../src/config/env', () => ({
  ENV: {
    CLOUDINARY_CLOUD_NAME: 'test-cloud',
    CLOUDINARY_UPLOAD_PRESET: 'test-preset',
    CLOUDINARY_FOLDER: 'test-images',
  },
}));

describe('cloudinaryService', () => {
  describe('getOptimizedImageUrl', () => {
    it('should generate optimized image URL with default options', () => {
      const publicId = 'test-images/product-123/test-image';
      const url = getOptimizedImageUrl(publicId);

      expect(url).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/w_400,h_400,c_fill,q_auto:good,f_auto/test-images/product-123/test-image'
      );
    });

    it('should generate optimized image URL with custom options', () => {
      const publicId = 'test-images/product-123/test-image';
      const options = {
        width: 800,
        height: 600,
        crop: 'scale',
        quality: 'auto:best',
      };

      const url = getOptimizedImageUrl(publicId, options);

      expect(url).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/w_800,h_600,c_scale,q_auto:best,f_auto/test-images/product-123/test-image'
      );
    });

    it('should handle missing width option', () => {
      const publicId = 'test-image';
      const options = { height: 300 };

      const url = getOptimizedImageUrl(publicId, options);

      expect(url).toContain('w_400');
      expect(url).toContain('h_300');
    });

    it('should handle empty options object', () => {
      const publicId = 'test-image';
      const url = getOptimizedImageUrl(publicId, {});

      expect(url).toContain('w_400,h_400,c_fill,q_auto:good,f_auto');
    });
  });

  describe('createProductFolder', () => {
    it('should return true and log folder creation message', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const productId = '123';

      const result = await createProductFolder(productId);

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Product folder will be created automatically: test-images/product-123'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('URL generation validation', () => {
    it('should include all transformation parameters', () => {
      const publicId = 'test-image';
      const options = {
        width: 300,
        height: 200,
        crop: 'thumb',
        quality: 'auto:low',
      };

      const url = getOptimizedImageUrl(publicId, options);

      expect(url).toContain('w_300');
      expect(url).toContain('h_200');
      expect(url).toContain('c_thumb');
      expect(url).toContain('q_auto:low');
      expect(url).toContain('f_auto');
    });

    it('should handle large dimensions', () => {
      const publicId = 'test-image';
      const options = { width: 1920, height: 1080 };

      const url = getOptimizedImageUrl(publicId, options);

      expect(url).toContain('w_1920,h_1080');
      expect(url).toMatch(
        /^https:\/\/res\.cloudinary\.com\/test-cloud\/image\/upload\/w_\d+,h_\d+,c_fill,q_auto:good,f_auto\//
      );
    });
  });
});
