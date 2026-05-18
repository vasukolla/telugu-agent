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
import { fetchDailyVocab } from './lib/api';
import { getDueWords } from './lib/srs';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [mode, setMode] = useState<AppMode>('home');
  const [vocab, setVocab] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVocab = async () => {
    setLoading(true);
    const serverData = await fetchDailyVocab();
    
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
            {mode === 'home' && <Home key="home" onSelectMode={setMode} />}
            {mode === 'read' && <ReadingApp key="read" vocab={vocab} />}
            {mode === 'speak' && <SpeakingApp key="speak" vocab={vocab} />}
            {mode === 'story' && <StoryApp key="story" />}
            {mode === 'grammar' && <GrammarApp key="grammar" />}
          </AnimatePresence>
        )}
      </main>
      
      {/* Background decoration elements */}
      <div className="fixed top-10 left-10 w-32 h-32 bg-white rounded-full opacity-20 blur-2xl pointer-events-none"></div>
      <div className="fixed bottom-10 right-10 w-64 h-64 bg-yellow-300 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
    </div>
  );
}

