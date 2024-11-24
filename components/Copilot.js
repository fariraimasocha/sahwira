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
            disabled={isLoading || isAnalyzing || isSaving}
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
              disabled={isLoading || isAnalyzing || isSaving}
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

        {(isLoading || isAnalyzing || isSaving) && (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              {isLoading ? 'Transcribing...' : 
               isAnalyzing ? 'Processing with AI...' :
               'Saving conversation...'}
            </span>
          </div>
        )}

        {messages.length > 0 && (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-lg",
                  message.role === 'user' 
                    ? "bg-muted" 
                    : "bg-primary/10"
                )}
              >
                <div className="text-sm font-medium mb-1">
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                </div>
                <div className="whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {messages.length === 0 && !transcription && !aiResponse && (
          <div className="text-center text-muted-foreground py-8">
            Start a conversation by recording your voice
          </div>
        )}
      </CardContent>
    </Card>
  );
}