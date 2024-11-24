"use client";
import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import toast from 'react-hot-toast';

export default function Copilot() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechSynthesisRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = handleStop;
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Error accessing microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleStop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    await sendAudioToWhisper(audioBlob);
  };

  const sendAudioToWhisper = async (audioBlob) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');

    try {
      const response = await fetch('/api/whisper', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data = await response.json();
      setTranscription(data.transcription);
      toast.success('Audio transcribed successfully');
      await processWithAI(data.transcription);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error('Error transcribing audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const processWithAI = async (text) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: text,
          model: "mixtral-8x7b-32768",
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process with AI');
      }

      const data = await response.json();
      setAiResponse(data.content);
      
      // Automatically start speaking the response
      speakText(data.content);
    } catch (error) {
      console.error('AI processing error:', error);
      toast.error(error.message || 'Failed to process with AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const speakText = (text) => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error('Failed to speak response');
    };

    speechSynthesisRef.current = window.speechSynthesis;
    speechSynthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>AI Voice Assistant</CardTitle>
        <CardDescription>
          Record your voice to interact with the AI assistant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "default"}
            disabled={isLoading || isAnalyzing}
          >
            {isRecording ? (
              <>
                <MicOff className="mr-2 h-4 w-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Start Recording
              </>
            )}
          </Button>

          {aiResponse && (
            <Button
              onClick={isSpeaking ? stopSpeaking : () => speakText(aiResponse)}
              variant="outline"
              disabled={isLoading || isAnalyzing}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="mr-2 h-4 w-4" />
                  Stop Speaking
                </>
              ) : (
                <>
                  <Volume2 className="mr-2 h-4 w-4" />
                  Speak Response
                </>
              )}
            </Button>
          )}
        </div>

        {(isLoading || isAnalyzing) && (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{isLoading ? 'Transcribing...' : 'Processing with AI...'}</span>
          </div>
        )}

        {transcription && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Your Message:</h3>
            <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
              {transcription}
            </div>
          </div>
        )}

        {aiResponse && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">AI Response:</h3>
            <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
              {aiResponse}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
