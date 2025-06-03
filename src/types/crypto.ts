
export interface EncryptionResult {
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
  salt: Uint8Array;
  filename: string;
}

export interface StorageEncryptionResult {
  storagePath: string;
  iv: Uint8Array;
  salt: Uint8Array;
  filename: string;
}

export interface DecryptionResult {
  decryptedData: ArrayBuffer;
  filename: string;
}

export interface FileProcessingProgress {
  percentage: number;
  bytesProcessed: number;
  totalBytes: number;
  filename: string;
}

export interface ProcessedFile {
  id: string;
  originalFile: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: EncryptionResult | DecryptionResult | StorageEncryptionResult;
  error?: string;
  storagePath?: string;
  encryptedFileId?: string;
}

export type OperationType = 'encrypt' | 'decrypt';
