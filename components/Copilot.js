"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import toast from 'react-hot-toast';
import cn from 'classnames';
import { useSession } from 'next-auth/react';

export default function Copilot({ conversation, onConversationUpdate }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [messages, setMessages] = useState([]);
  const { data: session } = useSession();
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechSynthesisRef = useRef(null);

  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages);
      const lastUserMessage = conversation.messages.findLast(m => m.role === 'user');
      const lastAiMessage = conversation.messages.findLast(m => m.role === 'assistant');
      if (lastUserMessage) setTranscription(lastUserMessage.content);
      if (lastAiMessage) setAiResponse(lastAiMessage.content);
    } else {
      setMessages([]);
      setTranscription('');
      setAiResponse('');
    }
  }, [conversation]);

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
      
      const newMessages = [
        ...messages,
        { role: 'user', content: text },
        { role: 'assistant', content: data.content }
      ];
      setMessages(newMessages);

      await saveConversation(newMessages);
      
      speakText(data.content);
    } catch (error) {
      console.error('AI processing error:', error);
      toast.error(error.message || 'Failed to process with AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveConversation = async (messages) => {
    setIsSaving(true);
    try {
      if (!session?.user?.id) {
        console.error('No user session found');
        return;
      }

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages,
          userId: session.user.id
        }),
      });

      if (!response.ok) throw new Error('Failed to save conversation');
      const conversation = await response.json();
      onConversationUpdate?.();
    } catch (error) {
      console.error('Error saving conversation:', error);
    } finally {
      setIsSaving(false);
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
    <Card className="w-full max-w-3xl mx-auto rounded-lg shadow-md">
      <CardHeader className="space-y-2 md:space-y-4">
        <CardTitle className="text-xl md:text-2xl text-center md:text-left">AI Voice Assistant</CardTitle>
        <CardDescription className="text-sm md:text-base text-center md:text-left">
          Record your voice to interact with the AI assistant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <Button 
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "default"}
            disabled={isLoading || isAnalyzing || isSaving}
            className="w-full md:w-auto min-w-[160px] relative"
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>
          <Button
            onClick={isSpeaking ? stopSpeaking : () => speakText(aiResponse)}
            variant="outline"
            disabled={!aiResponse || isLoading || isAnalyzing}
            className="w-full md:w-auto min-w-[160px]"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 mr-2" />
                Stop Speaking
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-2" />
                Speak Response
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="min-h-[100px] p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Your Message:</p>
            <p className="text-sm md:text-base whitespace-pre-wrap">
              {transcription || 'Your transcribed message will appear here...'}
            </p>
          </div>

          <div className="relative min-h-[150px] p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">AI Response:</p>
            {(isLoading || isAnalyzing) && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
            <p className="text-sm md:text-base whitespace-pre-wrap">
              {aiResponse || 'AI response will appear here...'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}