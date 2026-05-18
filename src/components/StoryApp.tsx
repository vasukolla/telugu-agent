import React, { useState, useEffect, useRef } from 'react';
import { Story, StorySentence } from '../types';
import { fetchStories } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { Play, VolumeX, ChevronLeft, Volume2, Key } from 'lucide-react';

export default function StoryApp() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  const [highlightedCharIndex, setHighlightedCharIndex] = useState(-1);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchStories();
      setStories(data);
      setLoading(false);
    }
    load();
    
    const handleRefresh = () => {
      setSelectedStory(null);
      stopStory();
      load();
    };
    window.addEventListener('refresh-stories', handleRefresh);
    
    return () => {
      window.speechSynthesis.cancel();
      window.removeEventListener('refresh-stories', handleRefresh);
    };
  }, []);

  const playStory = () => {
    if (!selectedStory) return;
    
    window.speechSynthesis.cancel();
    
    // We concatenate sentences to read, but actually we should read them one by one
    // to accurately highlight across sentences.
    readSentence(0);
  };

  const readSentence = (index: number) => {
    if (!selectedStory || index >= selectedStory.sentences.length) {
      setIsPlaying(false);
      setCurrentSentenceIndex(-1);
      setHighlightedCharIndex(-1);
      return;
    }

    setIsPlaying(true);
    setCurrentSentenceIndex(index);
    setHighlightedCharIndex(-1);

    const sentence = selectedStory.sentences[index];
    const utterance = new SpeechSynthesisUtterance(sentence.nativeText);
    utterance.lang = 'te-IN';
    utterance.rate = 0.7; // slower for kids
    
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setHighlightedCharIndex(event.charIndex);
      }
    };
    
    utterance.onend = () => {
      // Small pause before next sentence
      setTimeout(() => {
        readSentence(index + 1);
      }, 500);
    };
    
    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopStory = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentSentenceIndex(-1);
    setHighlightedCharIndex(-1);
  }

  if (loading) {
    return <div className="text-xl font-bold animate-pulse text-purple-600">Gathering storybooks...</div>;
  }

  if (!selectedStory) {
    return (
      <div className="w-full max-w-4xl flex flex-col gap-6">
        <h2 className="text-4xl font-bold text-center text-purple-900 mb-6 drop-shadow-sm">Story Time</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map(story => (
            <motion.button
              key={story.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedStory(story)}
              className="bg-white rounded-3xl p-6 shadow-xl border-4 border-purple-200 flex flex-col items-center justify-center text-center hover:border-purple-400 transition-colors"
            >
              <div className="text-7xl mb-4 bg-purple-50 w-32 h-32 flex items-center justify-center rounded-full">
                {story.emoji}
              </div>
              <h3 className="text-3xl font-bold text-gray-800">{story.title}</h3>
              <p className="text-xl text-purple-600 font-medium my-2">{story.titlePronunciation}</p>
              <p className="text-gray-500">{story.titleEnglish}</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 md:p-10 border-4 border-purple-200 flex flex-col relative overflow-hidden">
      
      <button 
        onClick={() => {
            stopStory();
            setSelectedStory(null);
        }}
        className="self-start mb-6 text-purple-600 font-bold flex items-center gap-2 hover:bg-purple-50 p-2 rounded-xl transition-colors"
      >
        <ChevronLeft /> Back to Stories
      </button>

      <div className="text-center mb-8">
        <span className="text-7xl inline-block mb-4">{selectedStory.emoji}</span>
        <h2 className="text-4xl font-bold text-gray-800">{selectedStory.title}</h2>
        <p className="text-2xl text-purple-500 font-medium">{selectedStory.titlePronunciation}</p>
      </div>

      <div className="flex flex-col gap-6 w-full mb-10">
        {selectedStory.sentences.map((sentence, sIdx) => {
            const isActive = currentSentenceIndex === sIdx;
            
            return (
              <div 
                key={sIdx} 
                className={`p-6 rounded-2xl transition-colors text-center ${isActive ? 'bg-purple-50 border-2 border-purple-300' : 'bg-gray-50 border-2 border-transparent'}`}
              >
                  {/* Hanzi with active tracking */}
                  <div className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight tracking-wide flex justify-center flex-wrap gap-1">
                      {(() => {
                          const words = sentence.nativeText.split(' ');
                          let currentIndex = 0;
                          return words.map((word, wIdx) => {
                              const wordStart = currentIndex;
                              const wordEnd = currentIndex + word.length;
                              currentIndex = wordEnd + 1; // account for space
                              const isHighlighted = isActive && highlightedCharIndex !== -1 && highlightedCharIndex >= wordStart && highlightedCharIndex <= wordEnd;
                              return (
                                  <span 
                                    key={wIdx} 
                                    className={`transition-colors duration-150 inline-block px-[4px] rounded ${isHighlighted ? 'bg-yellow-300 text-purple-900 shadow-sm' : ''}`}
                                  >
                                      {word}
                                  </span>
                              );
                          });
                      })()}
                  </div>
                  <div className={`text-xl font-medium mb-2 ${isActive ? 'text-purple-700' : 'text-gray-500'}`}>
                      {sentence.pronunciation}
                  </div>
                  <div className={`text-gray-600 ${isActive ? 'text-gray-800 font-medium' : ''}`}>
                      {sentence.english}
                  </div>
              </div>
            )
        })}
      </div>

      <div className="flex justify-center">
          {isPlaying ? (
              <button 
                onClick={stopStory}
                className="flex items-center gap-3 px-8 py-4 bg-red-100 text-red-600 rounded-full font-bold shadow-md hover:bg-red-200 active:scale-95 transition-all text-xl"
              >
                  <VolumeX size={28} /> Stop
              </button>
          ) : (
              <button 
                onClick={playStory}
                className="flex items-center gap-3 px-8 py-4 bg-purple-500 text-white rounded-full font-bold shadow-xl hover:bg-purple-600 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all text-xl"
              >
                  <Play fill="currentColor" size={28} /> Read to Me
              </button>
          )}
      </div>

    </div>
  );
}
