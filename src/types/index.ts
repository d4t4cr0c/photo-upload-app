export interface ProductImage {
  id: string;
  uri: string;
  filename: string;
  uploaded?: boolean;
  uploadError?: string;
}

export interface Product {
  id: string;
  images: ProductImage[];
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  mercadoLibreUrl?: string;
  errorMessage?: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
}

export interface PollingPayload {
  productId: string;
  status: 'processing' | 'completed' | 'failed';
  message?: string;
  product?: {
    mercado_libre_listing?: {
      permalink: string;
    };
  };
}

export interface UploadResult {
  success: boolean;
  publicId?: string;
  secureUrl?: string;
  error?: string;
}

export interface BulkUploadOptions {
  maxConcurrent?: number;
  onProgress?: (imageIndex: number, progress: number) => void;
  onImageComplete?: (imageIndex: number, result: UploadResult) => void;
}
