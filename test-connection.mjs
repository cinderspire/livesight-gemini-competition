/**
 * Gemini Live API Connection Test
 * Run: node test-connection.mjs YOUR_API_KEY
 */
import { GoogleGenAI, Modality } from '@google/genai';

const API_KEY = process.argv[2] || 'AIzaSyBRNdzIWTZs8ntlvSYMbZEuDqoV9MeGeAs';

console.log('='.repeat(50));
console.log('Gemini Live API Connection Test');
console.log('='.repeat(50));
console.log('API Key:', API_KEY.substring(0, 15) + '...');
console.log('');

async function testConnection() {
  try {
    // IMPORTANT: Use v1alpha for Live API access
    const ai = new GoogleGenAI({
      apiKey: API_KEY,
      apiVersion: 'v1alpha'
    });

    // Test 1: Simple text generation first
    console.log('Test 1: Text Generation...');
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: 'Say OK',
      });
      console.log('✅ Text Generation works! Response:', response.text);
    } catch (e) {
      console.log('❌ Text Generation failed:', e.message);
      if (e.message.includes('quota') || e.message.includes('429')) {
        console.log('\n⚠️  API quota exceeded! Get a new API key from:');
        console.log('   https://aistudio.google.com/apikey\n');
        return;
      }
    }

    // Test 2: Live API Connection
    console.log('\nTest 2: Live API Connection...');
    // Try different model names
    const models = [
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash-live-001',
      'gemini-live-2.5-flash-preview'
    ];
    const liveModel = models[0]; // Try gemini-2.0-flash-exp
    console.log('Model:', liveModel);

    let connected = false;
    let sessionRef = null;

    const connectPromise = ai.live.connect({
      model: liveModel,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        },
      },
      callbacks: {
        onopen: () => {
          connected = true;
          console.log('✅ Live API Connected!');
          console.log('');
          console.log('='.repeat(50));
          console.log('SUCCESS! All tests passed.');
          console.log('The API is working correctly.');
          console.log('='.repeat(50));

          // Close after 2 seconds
          setTimeout(() => {
            if (sessionRef) {
              sessionRef.close();
            }
            process.exit(0);
          }, 2000);
        },
        onmessage: (msg) => {
          if (msg.serverContent) {
            console.log('📨 Received server message');
          }
        },
        onclose: () => {
          console.log('Connection closed');
          if (!connected) {
            console.log('❌ Connection closed before establishing');
          }
          process.exit(connected ? 0 : 1);
        },
        onerror: (err) => {
          console.log('❌ Connection error:', err);
        },
      }
    });

    const session = await connectPromise;
    sessionRef = session;
    console.log('Waiting for connection...');

    // Timeout after 15 seconds
    setTimeout(() => {
      if (!connected) {
        console.log('❌ Connection timeout after 15 seconds');
        console.log('');
        console.log('Possible issues:');
        console.log('1. API key quota exceeded');
        console.log('2. Network connectivity issues');
        console.log('3. Model not available');
        if (sessionRef) {
          sessionRef.close();
        }
        process.exit(1);
      }
    }, 15000);

  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.message.includes('quota') || error.message.includes('429')) {
      console.log('\n⚠️  API quota exceeded! Get a new API key from:');
      console.log('   https://aistudio.google.com/apikey');
    }
    if (error.message.includes('model')) {
      console.log('\n⚠️  Model not available. Try different model.');
    }
    process.exit(1);
  }
}

testConnection();
