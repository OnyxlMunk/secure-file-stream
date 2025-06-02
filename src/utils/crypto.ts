
const ALGORITHM = { name: 'AES-GCM', length: 256 };
const PBKDF2_ITERATIONS = 600000; // Strong iteration count for production
const IV_LENGTH = 12; // 96 bits for AES-GCM
const SALT_LENGTH = 32; // 256 bits
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks for streaming

export class CryptoService {
  static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const baseKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt,
        iterations: PBKDF2_ITERATIONS,
      },
      baseKey,
      ALGORITHM,
      false,
      ['encrypt', 'decrypt']
    );
  }

  static generateRandomBytes(length: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  static async encryptFile(
    file: File,
    password: string,
    onProgress?: (progress: number) => void
  ): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array; salt: Uint8Array }> {
    const salt = this.generateRandomBytes(SALT_LENGTH);
    const iv = this.generateRandomBytes(IV_LENGTH);
    const key = await this.deriveKey(password, salt);
    
    const fileData = await file.arrayBuffer();
    
    if (onProgress) onProgress(50);
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      fileData
    );
    
    if (onProgress) onProgress(100);
    
    return { encryptedData, iv, salt };
  }

  static async decryptFile(
    encryptedData: ArrayBuffer,
    password: string,
    iv: Uint8Array,
    salt: Uint8Array,
    onProgress?: (progress: number) => void
  ): Promise<ArrayBuffer> {
    const key = await this.deriveKey(password, salt);
    
    if (onProgress) onProgress(50);
    
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );
    
    if (onProgress) onProgress(100);
    
    return decryptedData;
  }

  static createEncryptedBlob(
    encryptedData: ArrayBuffer,
    iv: Uint8Array,
    salt: Uint8Array,
    originalFilename: string
  ): Blob {
    // Create a header with metadata
    const header = new TextEncoder().encode(JSON.stringify({
      filename: originalFilename,
      ivLength: iv.length,
      saltLength: salt.length,
    }));
    
    const headerLength = new Uint32Array([header.length]);
    
    // Combine: headerLength + header + salt + iv + encryptedData
    const combined = new Uint8Array(
      4 + header.length + salt.length + iv.length + encryptedData.byteLength
    );
    
    let offset = 0;
    combined.set(new Uint8Array(headerLength.buffer), offset);
    offset += 4;
    combined.set(header, offset);
    offset += header.length;
    combined.set(salt, offset);
    offset += salt.length;
    combined.set(iv, offset);
    offset += iv.length;
    combined.set(new Uint8Array(encryptedData), offset);
    
    return new Blob([combined], { type: 'application/octet-stream' });
  }

  static async parseEncryptedFile(file: File): Promise<{
    encryptedData: ArrayBuffer;
    iv: Uint8Array;
    salt: Uint8Array;
    originalFilename: string;
  }> {
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    
    // Read header length
    const headerLength = new Uint32Array(buffer.slice(0, 4))[0];
    
    // Read header
    const headerData = data.slice(4, 4 + headerLength);
    const header = JSON.parse(new TextDecoder().decode(headerData));
    
    let offset = 4 + headerLength;
    
    // Read salt
    const salt = data.slice(offset, offset + header.saltLength);
    offset += header.saltLength;
    
    // Read IV
    const iv = data.slice(offset, offset + header.ivLength);
    offset += header.ivLength;
    
    // Read encrypted data
    const encryptedData = buffer.slice(offset);
    
    return {
      encryptedData,
      iv,
      salt,
      originalFilename: header.filename,
    };
  }
}
