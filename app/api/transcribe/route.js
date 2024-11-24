"use server";
import { AssemblyAI } from 'assemblyai';

// Initialize AssemblyAI client
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI_API_KEY
});

export async function POST(request) {
  try {
    const data = await request.json();
    const { audioUrl } = data;

    if (!audioUrl) {
      return Response.json({ error: 'Audio URL is required' }, { status: 400 });
    }

    const config = {
      audio_url: audioUrl,
      language_detection: true
    };

    const transcript = await client.transcripts.transcribe(config);

    return Response.json({ 
      text: transcript.text,
      status: transcript.status
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return Response.json({ 
      error: error.message || 'Failed to transcribe audio' 
    }, { status: 500 });
  }
}
