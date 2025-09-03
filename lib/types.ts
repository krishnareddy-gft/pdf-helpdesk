export interface UploadedFile {
  name: string;
  size: number;
  blobUrl: string;
  uploadedAt: Date;
  id: string;
  file?: File; // Optional file object for browser-based operations
}

export interface ProcessedFile {
  url: string;
  name: string;
  size: number;
  processedAt: Date;
}

export interface PageRange {
  start: number;
  end: number;
}

export interface OverlayData {
  id: string;
  page: number;
  type: 'signature' | 'text' | 'image';
  data: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  color?: string;
}

export interface CompressionLevel {
  level: 'light' | 'balanced' | 'strong';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MergeRequest {
  files: string[];
}

export interface SplitRequest {
  file: string;
  ranges: PageRange[];
}



export interface CompressRequest {
  file: string;
  level?: 'light' | 'balanced' | 'strong';
}

export interface SignRequest {
  file: string;
  overlays: OverlayData[];
}



export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  enabled: boolean;
  premium?: boolean;
}
