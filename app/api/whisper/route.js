import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
        return new Response(JSON.stringify({ error: 'Audio file is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const transcription = await getWhisperTranscription(audioFile);
        return new Response(JSON.stringify({ transcription }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error transcribing audio with Whisper:', error);
        return new Response(JSON.stringify({ error: 'Failed to transcribe audio' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

async function getWhisperTranscription(audioFile) {
    const response = await groq.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-large-v3-turbo",
    });
    return response.text;
}
