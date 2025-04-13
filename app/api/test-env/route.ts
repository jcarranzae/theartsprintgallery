import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_AIML_API_KEY;
  
  return NextResponse.json({
    apiKeyExists: !!apiKey,
    apiKeyLength: apiKey?.length,
    apiKeyStartsWith: apiKey?.substring(0, 4)
  });
} 