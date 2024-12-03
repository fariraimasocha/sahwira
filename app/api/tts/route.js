// pages/api/text-to-speech.js
import { createClient } from '@deepgram/sdk';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Get text from request body
    const { text } = await req.json();

    // Validate input
    if (!text) {
      return NextResponse.json(
        { message: 'Text is required' },
        { status: 400 }
      );
    }

    // Create Deepgram client
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '');

    // Request speech generation
    const response = await deepgram.speak.request(
      { text },
      {
        model: 'aura-asteria-en',
        encoding: 'linear16',
        container: 'wav',
      }
    );

    // Get the audio stream
    const stream = await response.getStream();

    if (!stream) {
      return NextResponse.json(
        { message: 'Failed to generate audio stream' },
        { status: 500 }
      );
    }

    // Return the stream directly
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'audio/wav',
        'Transfer-Encoding': 'chunked',
      },
    });
    
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Config for handling binary data
export const config = {
  api: {
    bodyParser: false,
  },
};
