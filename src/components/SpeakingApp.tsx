import React, { useState, useEffect, useRef } from 'react';
import { VocabWord } from '../types';
import { updateSrsWord } from '../lib/srs';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Play, Volume2, Star, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SpeakingApp({ vocab }: { vocab: VocabWord[]; key?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'listening' | 'success' | 'try_again'>('idle');
  const [recognizedText, setRecognizedText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const currentWord = vocab?.[currentIndex];

  // Reset state when word changes
  useEffect(() => {
      setFeedback('idle');
      setRecognizedText('');
      setErrorMessage('');
  }, [currentIndex]);

  const startRecording = async () => {
    setErrorMessage('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsEvaluating(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        audioChunksRef.current = [];
        
        // Stop all tracks to release the microphone immediately
        stream.getTracks().forEach(track => track.stop());

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const base64Raw = base64data.split(',')[1];
          const mimeType = audioBlob.type || 'audio/webm';

          if (!base64Raw) {
             console.error("Audio recording was too short or empty.");
             setIsEvaluating(false);
             setFeedback('try_again');
             setErrorMessage('Audio recording was too short. Please hold down the microphone button while speaking.');
             return;
          }

          try {
            const res = await fetch('/api/evaluate-speech', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                expectedHanzi: currentWord?.nativeText, 
                audioBase64: base64Raw,
                mimeType
              })
            });
            const data = await res.json();
            setIsEvaluating(false);

            if (data.success) {
              setRecognizedText(data.recognizedText || '');
              if (data.isMatch) {
                if (currentWord) updateSrsWord(currentWord, 5);
                setFeedback('success');
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ['#22c55e', '#fef08a']
                });
              } else {
                if (currentWord) updateSrsWord(currentWord, 1);
                setFeedback('try_again');
              }
            } else {
                setFeedback('try_again');
                setErrorMessage('Oops! Something went wrong while checking your pronunciation.');
            }
          } catch(e) {
             setIsEvaluating(false);
             console.error("Evaluation error:", e);
             setFeedback('try_again');
             setErrorMessage('Network error. Check your connection and try again.');
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setFeedback('listening');
      setRecognizedText('');
    } catch (e: any) {
       console.error("Mic access error:", e);
       setIsRecording(false);
       setFeedback('idle');
       setErrorMessage('Microphone access is not allowed or blocked. If you are using this app inside a preview, try opening it in a new tab using the icon in the top right.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (!currentWord) return;
    const utterance = new SpeechSynthesisUtterance(currentWord.nativeText);
    utterance.lang = 'te-IN';
    utterance.rate = 0.7; // slower for kids
    window.speechSynthesis.speak(utterance);
  };

  if (!vocab || vocab.length === 0) return <div>No vocabulary found.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full flex flex-col items-center"
    >
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-lg w-full flex flex-col items-center border-4 border-green-100 relative overflow-hidden">
            
            <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">Let's Speak!</h2>
            
            <div className="flex flex-col items-center gap-2 mb-10">
                <span className="text-8xl mb-4">{currentWord.emoji}</span>
                <h1 className="text-7xl font-bold text-gray-800">{currentWord.nativeText}</h1>
                <h3 className="text-4xl text-green-600 font-bold">{currentWord.pronunciation}</h3>
                <p className="text-xl text-gray-500 capitalize">{currentWord.english}</p>
                
                <button 
                  onClick={playAudio}
                  className="mt-4 flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-full font-bold hover:bg-green-200 transition-colors"
                >
                  <Volume2 /> Listen
                </button>
            </div>

            <div className="flex flex-col items-center w-full">
                <button
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    disabled={isEvaluating}
                    className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        isRecording 
                            ? 'bg-red-500 scale-110 shadow-[0_0_40px_rgba(239,68,68,0.5)] text-white' 
                            : 'bg-green-500 hover:bg-green-600 text-white shadow-xl hover:scale-105'
                    }`}
                >
                    {isRecording ? <Mic size={64} className="animate-pulse" /> : <Mic size={64} />}
                    
                    {/* Ripple effect when recording */}
                    {isRecording && (
                        <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75"></div>
                    )}
                </button>
                <p className="mt-6 text-gray-500 font-medium text-lg">
                    {isEvaluating ? "Thinking..." : isRecording ? "Listening... (Release to stop)" : "Hold microphone to speak"}
                </p>
                
                {recognizedText && feedback !== 'listening' && !isEvaluating && (
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-400">You said something like:</p>
                        <p className={`text-2xl font-bold ${feedback === 'success' ? 'text-green-500' : 'text-red-400'}`}>"{recognizedText}"</p>
                    </div>
                )}
                
                {errorMessage && (
                    <div className="mt-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl max-w-sm text-center font-medium">
                        {errorMessage}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {feedback === 'success' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                    >
                        <span className="text-8xl mb-4">🎉</span>
                        <h2 className="text-5xl font-bold text-green-500 mb-8 drop-shadow-sm">Perfect!</h2>
                        <button 
                            onClick={() => {
                                setFeedback('idle');
                                setCurrentIndex(p => (p + 1) % vocab.length);
                            }}
                            className="bg-green-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-xl hover:bg-green-600 hover:scale-105 transition-all"
                        >
                            Next Word
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </motion.div>
  );
}
