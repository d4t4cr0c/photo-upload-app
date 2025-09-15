import { uploadImages } from '@/services/uploadService';
import { ProductImage } from '@/types';

// Mock fetch
global.fetch = jest.fn();

// Mock environment config
jest.mock('@/config/env', () => ({
  ENV: {
    BACKEND_API_URL: 'http://localhost:3000',
    FRONTEND_API_KEY: 'test-api-key',
  },
}));

describe('Webhook Upload Service', () => {
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
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  describe('uploadImages', () => {
    it('should upload multiple images via webhook', async () => {
      const results = await uploadImages(mockImages, 'test123');

      expect(results).toHaveLength(3);
      results.forEach((result: any) => {
        expect(result.success).toBe(true);
      });

      // Verify that fetch was called once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle empty array', async () => {
      const results = await uploadImages([], 'test123');
      expect(results).toHaveLength(0);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle upload failures gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const results = await uploadImages(mockImages, 'test123');

      expect(results).toHaveLength(3);
      results.forEach((result: any) => {
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });
});
