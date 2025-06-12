// lib/klingJwtUtils.ts - Implementación JWT corregida basada en el ejemplo oficial
import { createHmac } from 'crypto';

// Base64 URL encode function
function base64UrlEncode(data: string): string {
  return Buffer.from(data)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Generate JWT token for Kling API (siguiendo el ejemplo oficial de Python)
export function generateKlingJWT(): string {
  // Get access key and secret key from environment
  const accessKey = process.env.KLING_ACCESS_KEY;
  const secretKey = process.env.KLING_SECRET_KEY;

  if (!accessKey || !secretKey) {
    throw new Error('KLING_ACCESS_KEY and KLING_SECRET_KEY environment variables are required');
  }

  const now = Math.floor(Date.now() / 1000);

  // JWT Header (mismo que el ejemplo Python)
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  // JWT Payload (siguiendo exactamente el ejemplo Python)
  const payload = {
    iss: accessKey,           // access key como issuer
    exp: now + 1800,          // current time + 30 minutes
    nbf: now - 5              // current time - 5 seconds
  };

  try {
    // Encode header and payload
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));

    // Create signature usando secret key
    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    const signature = createHmac('sha256', secretKey)
      .update(dataToSign)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Combine to create final JWT
    const token = `${dataToSign}.${signature}`;

    console.log('🔐 Generated Kling JWT token (first 50 chars):', token.substring(0, 50) + '...');
    console.log('🔑 Using access key:', accessKey);
    console.log('⏱️ Token expires at:', new Date((now + 1800) * 1000).toISOString());

    return token;
  } catch (error) {
    console.error('❌ JWT generation error:', error);
    throw new Error('Failed to generate Kling JWT token');
  }
}

// Validate JWT token structure (opcional, para debugging)
export function validateKlingJWT(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ Invalid JWT format: should have 3 parts');
      return false;
    }

    const [header, payload, signature] = parts;

    // Decode payload to check expiration
    const decodedPayload = JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/') + '===', 'base64').toString()
    );

    const now = Math.floor(Date.now() / 1000);

    if (decodedPayload.exp <= now) {
      console.error('❌ JWT token has expired');
      return false;
    }

    if (decodedPayload.nbf > now) {
      console.error('❌ JWT token is not yet valid (nbf)');
      return false;
    }

    console.log('✅ JWT token is valid');
    return true;
  } catch (error) {
    console.error('❌ JWT validation error:', error);
    return false;
  }
}

// Get authorization header for Kling API requests
export function getKlingAuthHeader(): { Authorization: string } {
  const token = generateKlingJWT();
  return {
    Authorization: `Bearer ${token}`
  };
}

// Debug function to check JWT payload
export function debugKlingJWT(token: string): void {
  try {
    const parts = token.split('.');
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/') + '===', 'base64').toString()
    );

    console.log('🔍 JWT Payload Debug:', {
      iss: payload.iss,
      exp: new Date(payload.exp * 1000).toISOString(),
      nbf: new Date(payload.nbf * 1000).toISOString(),
      timeToExpiry: `${payload.exp - Math.floor(Date.now() / 1000)} seconds`
    });
  } catch (error) {
    console.error('❌ JWT debug error:', error);
  }
}