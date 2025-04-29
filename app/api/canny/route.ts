import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  //console.log("Canny API payload:", body);

  const response = await fetch('https://api.us1.bfl.ai/v1/flux-pro-1.0-canny', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-key': process.env.NEXT_PUBLIC_BFL_API_KEY ?? '', // asegúrate de poner tu key en .env.local
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();
  //console.log("Canny API response:", result);
  return NextResponse.json(result);
}
