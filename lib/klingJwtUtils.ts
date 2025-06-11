// lib/klingJwtUtils.ts - Simple JWT implementation without external dependencies
import { createHmac } from 'crypto';

interface KlingJWTPayload {
  iss?: string; // issuer
  sub?: string; // subject  
  aud?: string; // audience
  exp?: number; // expiration time
  iat?: number; // issued at
  jti?: string; // JWT ID
}

// Base64 URL encode function
function base64UrlEncode(data: string): string {
  return Buffer.from(data)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Generate unique JWT ID
function generateJTI(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Manual JWT generation
export function generateKlingJWT(): string {
  const now = Math.floor(Date.now() / 1000);
  
  // JWT Header
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  // JWT Payload
  const payload: KlingJWTPayload = {
    iss: process.env.KLING_ISSUER || 'your-app-name',
    sub: process.env.KLING_SUBJECT || 'api-access', 
    aud: 'https://api-singapore.klingai.com',
    iat: now,
    exp: now + 300, // 5 minutes
    jti: generateJTI()
  };

  // Get secret key
  const secretKey = process.env.KLING_JWT_SECRET;
  if (!secretKey) {
    throw new Error('KLING_JWT_SECRET environment variable is required');
  }

  try {
    // Encode header and payload
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    
    // Create signature
    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    const signature = createHmac('sha256', secretKey)
      .update(dataToSign)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Combine to create JWT
    const token = `${dataToSign}.${signature}`;
    
    console.log('🔐 Generated Kling JWT token:', token.substring(0, 50) + '...');
    return token;
  } catch (error) {
    console.error('❌ JWT generation error:', error);
    throw new Error('Failed to generate JWT token');
  }
}

// Validate JWT token (basic validation)
export function validateKlingJWT(token: string): boolean {
  try {
    const secretKey = process.env.KLING_JWT_SECRET;
    if (!secretKey) return false;

    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [header, payload, signature] = parts;
    const dataToSign = `${header}.${payload}`;
    
    const expectedSignature = createHmac('sha256', secretKey)
      .update(dataToSign)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    if (signature !== expectedSignature) return false;

    // Check expiration
    const decodedPayload = JSON.parse(
      Buffer.from(payload + '===', 'base64url').toString()
    );
    
    const now = Math.floor(Date.now() / 1000);
    return decodedPayload.exp > now;
  } catch (error) {
    console.error('JWT validation error:', error);
    return false;
  }
}

// Get JWT header for API requests
export function getKlingAuthHeader(): { Authorization: string } {
  const token = generateKlingJWT();
  return {
    Authorization: `Bearer ${token}`
  };
}