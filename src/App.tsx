/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Home from './components/Home';
import ReadingApp from './components/ReadingApp';
import SpeakingApp from './components/SpeakingApp';
import StoryApp from './components/StoryApp';
import GrammarApp from './components/GrammarApp';
import { AppMode, VocabWord } from './types';
import { fetchDailyVocab, submitFeedback } from './lib/api';
import { getDueWords } from './lib/srs';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [mode, setMode] = useState<AppMode>('home');
  const [vocab, setVocab] = useState<VocabWord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Feedback states
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadVocab = async (category?: string) => {
    setLoading(true);
    const catToFetch = category !== undefined ? category : selectedCategory;
    if (category !== undefined) {
      setSelectedCategory(category);
    }
    const serverData = await fetchDailyVocab(catToFetch || undefined);
    
    // Get up to 5 due words from SRS
    const dueWords = getDueWords(5);
    
    // Filter out duplicates from server data
    const newWords = serverData.filter(sw => !dueWords.some(dw => dw.nativeText === sw.nativeText));
    
    // Combine due words and new words
    setVocab([...dueWords, ...newWords]);
    setLoading(false);
  };

  useEffect(() => {
    loadVocab();
  }, []);

  return (
    <div className="min-h-screen bg-sky-100 font-sans selection:bg-yellow-300">
      {/* Header for app modes */}
      <AnimatePresence>
        {mode !== 'home' && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 p-4 z-50 flex items-center justify-between"
          >
            <button 
              onClick={() => setMode('home')}
              className="bg-white hover:bg-gray-50 text-blue-900 p-3 rounded-full shadow-md transition-all active:scale-95 flex items-center gap-2 font-bold"
            >
              <ArrowLeft size={24} /> Back
            </button>
            <div className="flex gap-4">
              {mode !== 'grammar' && (
                <button 
                  onClick={() => {
                    if (mode === 'story') {
                      window.dispatchEvent(new CustomEvent('refresh-stories'));
                    } else {
                      loadVocab();
                    }
                  }}
                  className="bg-white/90 hover:bg-white backdrop-blur-sm px-4 py-2 rounded-full font-bold text-blue-900 shadow-sm border border-white flex items-center gap-2 transition-all active:scale-95"
                  title={mode === 'story' ? "Get new stories" : "Get new words"}
                >
                  <RefreshCw size={18} /> {mode === 'story' ? 'New Stories' : 'New Words'}
                </button>
              )}
              <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-blue-900 shadow-sm border border-white">
                Telugu
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`${mode === 'home' ? 'pt-0' : 'pt-20'} pb-10 px-4 max-w-7xl mx-auto flex items-center justify-center min-h-screen`}>
        {loading && <div className="text-2xl font-bold text-blue-500 animate-pulse">Waking up the tiger...</div>}
        
        {!loading && (
          <AnimatePresence mode="wait">
            {mode === 'home' && (
              <Home 
                key="home" 
                onSelectMode={(newMode) => {
                  setMode(newMode);
                }} 
              />
            )}
            {mode === 'read' && (
              <ReadingApp 
                key="read" 
                vocab={vocab} 
                selectedCategory={selectedCategory} 
                onCategoryChange={(cat) => { loadVocab(cat); }} 
              />
            )}
            {mode === 'speak' && <SpeakingApp key="speak" vocab={vocab} />}
            {mode === 'story' && <StoryApp key="story" />}
            {mode === 'grammar' && <GrammarApp key="grammar" />}
          </AnimatePresence>
        )}
      </main>
      
      {/* Background decoration elements */}
      <div className="fixed top-10 left-10 w-32 h-32 bg-white rounded-full opacity-20 blur-2xl pointer-events-none"></div>
      <div className="fixed bottom-10 right-10 w-64 h-64 bg-yellow-300 rounded-full opacity-10 blur-3xl pointer-events-none"></div>

      {/* Feedback FAB Button */}
      <button 
        onClick={() => {
          setSelectedRating('');
          setComment('');
          setSubmitted(false);
          setIsFeedbackOpen(true);
        }}
        className="fixed bottom-6 right-6 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-extrabold px-5 py-3 rounded-full shadow-lg border-2 border-white flex items-center gap-2 hover:scale-105 active:scale-95 transition-all z-40 group cursor-pointer"
        title="Give Feedback"
      >
        <span className="text-xl group-hover:animate-bounce">💬</span>
        <span>Feedback</span>
      </button>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFeedbackOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-yellow-300 relative z-10 text-center"
            >
              <button 
                onClick={() => setIsFeedbackOpen(false)}
                className="absolute top-4 right-4 text-blue-900/60 hover:text-blue-900 p-2 rounded-full hover:bg-gray-100 transition-all active:scale-95"
              >
                ✕
              </button>

              {!submitted ? (
                <>
                  <h3 className="text-2xl font-extrabold text-blue-900 mb-2">How was your Telugu lesson? 🐅</h3>
                  <p className="text-gray-600 mb-6 font-medium">Select an emoji to tell us how you feel!</p>
                  
                  {/* Rating Emojis */}
                  <div className="flex justify-around mb-6">
                    {[
                      { emoji: '😢', label: 'Hard', id: 'hard' },
                      { emoji: '😐', label: 'Okay', id: 'okay' },
                      { emoji: '😃', label: 'Good', id: 'good' },
                      { emoji: '🤩', label: 'Love it!', id: 'love' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedRating(item.id)}
                        className={`flex flex-col items-center p-3 rounded-2xl transition-all hover:bg-yellow-50 cursor-pointer ${
                          selectedRating === item.id 
                            ? 'bg-yellow-100 scale-110 border-2 border-yellow-400 font-extrabold' 
                            : 'opacity-70 hover:opacity-100 border-2 border-transparent'
                        }`}
                      >
                        <span className="text-4xl mb-1">{item.emoji}</span>
                        <span className="text-xs font-bold text-blue-900">{item.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Comment Input */}
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you like or what we can improve..."
                    rows={3}
                    className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-yellow-400 focus:outline-none font-medium text-blue-900 placeholder:text-gray-400 mb-6 resize-none transition-colors"
                  />

                  {/* Submit Button */}
                  <button
                    onClick={async () => {
                      if (!selectedRating) return;
                      setIsSubmitting(true);
                      const success = await submitFeedback(selectedRating, comment);
                      setIsSubmitting(false);
                      if (success) {
                        setSubmitted(true);
                      }
                    }}
                    disabled={!selectedRating || isSubmitting}
                    className={`w-full py-4 rounded-2xl font-extrabold text-lg text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      selectedRating 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 cursor-pointer' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Feedback 🚀'}
                  </button>
                </>
              ) : (
                <div className="py-6">
                  <span className="text-6xl mb-4 block animate-bounce">🎉</span>
                  <h3 className="text-2xl font-extrabold text-blue-900 mb-2">Thank you so much!</h3>
                  <p className="text-blue-700 font-medium mb-6">Your feedback helps tiger make the lessons even better!</p>
                  <button
                    onClick={() => setIsFeedbackOpen(false)}
                    className="bg-blue-900 hover:bg-blue-950 text-white font-extrabold px-8 py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

