// utils/image.ts

export function base64ToBuffer(base64: string): Buffer {
    return Buffer.from(base64, 'base64');
  }
  
  export function generateFilename(): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    return `imagen_${timestamp}.jpg`;
  }
  