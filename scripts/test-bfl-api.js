// scripts/test-bfl-api.js
// Script para probar la API de BFL directamente

require('dotenv').config({ path: '.env' });

async function testBFLAPI() {
  const baseUrl = process.env.BFL_BASE_URL;
  const apiKey = process.env.BFL_API_KEY;
  
  console.log('🔍 Testing BFL API Configuration...');
  console.log('📡 Base URL:', baseUrl);
  console.log('🔑 API Key exists:', !!apiKey);
  console.log('🔑 API Key length:', apiKey?.length || 0);
  
  if (!baseUrl || !apiKey) {
    console.error('❌ Missing BFL configuration in .env.local');
    console.log('Required variables:');
    console.log('  BFL_BASE_URL=https://api.us1.bfl.ai');
    console.log('  BFL_API_KEY=your-key-here');
    return;
  }
  
  // Test 1: Simple request a Kontext Pro
  console.log('\n🚀 Testing Flux Kontext Pro...');
  
  const payload = {
    prompt: "A beautiful sunset over mountains",
    seed: 42,
    aspect_ratio: "16:9",
    output_format: "png",
    prompt_upsampling: false,
    safety_tolerance: 2,
    input_image: null,
    webhook_url: null,
    webhook_secret: null
  };
  
  try {
    console.log('📤 Sending request...');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(`${baseUrl}/flux-kontext-pro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Key': apiKey
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`📊 Response status: ${response.status} ${response.statusText}`);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Obtener respuesta como texto primero para debug
    const responseText = await response.text();
    console.log('📄 Raw response:', responseText);
    
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status}`);
      console.error('Response:', responseText);
      return;
    }
    
    // Intentar parsear como JSON
    try {
      const data = JSON.parse(responseText);
      console.log('✅ Parsed JSON successfully:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.id) {
        console.log(`🎯 Task created with ID: ${data.id}`);
        
        // Test polling
        await testPolling(data.id, baseUrl, apiKey);
      }
      
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError.message);
      console.error('Raw response was:', responseText);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

async function testPolling(taskId, baseUrl, apiKey) {
  console.log('\n🔄 Testing polling...');
  
  try {
    const response = await fetch(`${baseUrl}/get_result?id=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Key': apiKey
      }
    });
    
    console.log(`📊 Polling status: ${response.status}`);
    
    const responseText = await response.text();
    console.log('📄 Polling response:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ Polling successful:');
      console.log('Status:', data.status);
      console.log('Progress:', data.progress);
    }
    
  } catch (error) {
    console.error('❌ Polling error:', error.message);
  }
}

// Ejecutar test
testBFLAPI().catch(console.error);