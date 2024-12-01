"use client"
import React, { useState, useRef, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2, Mic, MicOff, Upload, Copy, Save } from "lucide-react";

const AudioVisualizer = () => {
  return (
    <div className="flex justify-center items-center gap-[2px] h-16 bg-black/5 rounded-lg p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-gradient opacity-50" />
      {[...Array(28)].map((_, i) => (
        <div
          key={i}
          className="w-[2px] bg-gradient-to-t from-primary/80 via-primary/50 to-primary/20 rounded-full animate-wave"
          style={{
            height: '100%',
            animationDelay: `${i * 0.04}s`,
            animationDuration: `${0.8 + Math.random() * 0.5}s`,
            transform: 'scaleY(0.2)',
          }}
        />
      ))}
    </div>
  );
};

export default function Create() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/');
    },
  });

  // All state hooks
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // All ref hooks
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // All callback hooks
  const handleFileUpload = useCallback(async () => {
    if (!selectedFile) {
      toast.error('No file selected');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('audio', selectedFile);

    try {
      const response = await fetch('/api/whisper', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio file');
      }

      const data = await response.json();
      setTranscription(data.transcription);
      toast.success('Audio file transcribed successfully');
      await analyzeTranscription(data.transcription);
    } catch (error) {
      console.error('Error transcribing audio file:', error);
      toast.error('Error transcribing audio file. Please try again.');
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
    }
  }, [selectedFile]);

  // Loading state check
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

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
      await analyzeTranscription(data.transcription);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error('Error transcribing audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeTranscription = async (text) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: `Extract and list all tasks or action items from this text. Format them as a JSON array of objects with 'task' and 'priority' (High/Medium/Low) properties. Text: ${text}`,
          model: "mixtral-8x7b-32768",
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze transcription');
      }

      const data = await response.json();
      
      if (!data.content) {
        throw new Error('Invalid response from AI');
      }

      // Clean the response string to ensure it only contains the JSON part
      const jsonStr = data.content.trim()
        .replace(/```json\n?|\n?```/g, '')  // Remove code blocks
        .replace(/^[^[{]*/g, '')  // Remove any text before the first [ or {
        .replace(/[^}\]]*$/g, ''); // Remove any text after the last } or ]
      
      try {
        const parsedTasks = JSON.parse(jsonStr);
        if (!Array.isArray(parsedTasks)) {
          throw new Error('Response is not an array');
        }
        
        const validatedTasks = parsedTasks.map(task => ({
          task: task.task || 'Untitled Task',
          priority: ['High', 'Medium', 'Low'].includes(task.priority) ? task.priority : 'Medium'
        }));

        setTasks(validatedTasks);
        toast.success('Tasks extracted successfully');
      } catch (e) {
        console.error('Error parsing tasks:', e);
        // Create a single task from the raw content
        const fallbackTask = {
          task: data.content.length > 100 ? data.content.slice(0, 100) + '...' : data.content,
          priority: 'Medium'
        };
        setTasks([fallbackTask]);
        toast.warning('Could not parse tasks properly, created a single task instead');
      }
    } catch (error) {
      console.error('Error analyzing transcription:', error);
      toast.error(error.message || 'Error analyzing transcription');
      setTasks([]); // Reset tasks on error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcription)
      .then(() => toast.success('Transcription copied to clipboard'))
      .catch(() => toast.error('Failed to copy text. Please try again.'));
  };

  const handleSaveTasks = async () => {
    if (!session?.user?.email) {
      toast.error('You must be logged in to save tasks');
      return;
    }

    if (tasks.length === 0) {
      toast.error('No tasks to save');
      return;
    }

    setIsSaving(true);
    try {
      const tasksToSave = tasks.map(task => ({
        userId: session.user.email,
        task: task.task,
        priority: task.priority || 'Medium',
        status: 'pending'
      }));

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks: tasksToSave }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save tasks');
      }

      const result = await response.json();
      toast.success('Tasks saved successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving tasks:', error);
      toast.error(error.message || 'Error saving tasks. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-[72px] sm:pt-[80px]">
      <Toaster position="top-center" />
      <div className="max-w-[83.5rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-extrabold mb-8 bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">
          Create New Tasks
        </h1>
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Record or Upload Audio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-full relative overflow-hidden transition-all duration-300 ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'hover:shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:scale-[1.02] transform transition-transform'
                    }`}
                    disabled={isLoading}
                  >
                    {isRecording ? (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent bg-[length:200%_100%] animate-gradient" />
                        <MicOff className="mr-2 h-4 w-4 animate-float text-white" />
                        <span className="relative z-10 text-white">Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Start Recording
                      </>
                    )}
                  </Button>
                  {isRecording && (
                    <div className="mt-4">
                      <AudioVisualizer />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isLoading}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Audio
                </Button>
              </div>
              {isLoading && (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>

          {transcription && (
            <Card>
              <CardHeader>
                <CardTitle>Transcription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Button
                    onClick={handleCopy}
                    className="absolute top-2 right-2"
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {transcription}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isAnalyzing && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Analyzing transcription...</span>
            </div>
          )}

          {tasks.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Extracted Tasks</CardTitle>
                <Button
                  onClick={handleSaveTasks}
                  disabled={isSaving}
                  className="ml-4"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Tasks
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm">{task.task}</p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          task.priority === 'High' 
                            ? 'bg-red-100 text-red-800' 
                            : task.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}