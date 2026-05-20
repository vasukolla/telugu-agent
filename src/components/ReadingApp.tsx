import React, { useState } from 'react';
import { VocabWord } from '../types';
import { updateSrsWord } from '../lib/srs';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Volume2, Frown, Smile, Star } from 'lucide-react';

const categories = [
  { id: '', name: 'Random Mix 🎲' },
  { id: 'animals', name: 'Animals 🦁' },
  { id: 'colors', name: 'Colors 🎨' },
  { id: 'numbers', name: 'Numbers 🔢' },
  { id: 'fruits', name: 'Fruits 🍎' },
  { id: 'family members', name: 'Family 👨‍👩‍👧‍👦' },
  { id: 'body parts', name: 'Body Parts 👂' },
  { id: 'nature', name: 'Nature 🌳' },
  { id: 'food', name: 'Food 🍕' },
  { id: 'weather', name: 'Weather ☀️' },
  { id: 'clothes', name: 'Clothes 👕' },
  { id: 'emotions', name: 'Emotions 🤩' },
];

export default function ReadingApp({ 
  vocab, 
  selectedCategory, 
  onCategoryChange 
}: { 
  vocab: VocabWord[]; 
  selectedCategory: string; 
  onCategoryChange: (category: string) => void; 
  key?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCategoryChange = (cat: string) => {
    setCurrentIndex(0);
    setIsFlipped(false);
    onCategoryChange(cat);
  };

  const currentWord = vocab && vocab.length > 0 ? vocab[currentIndex] : null;

  const nextCard = () => {
    if (!vocab || vocab.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((p) => (p + 1) % vocab.length);
    }, 150);
  };

  const prevCard = () => {
    if (!vocab || vocab.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((p) => (p - 1 + vocab.length) % vocab.length);
    }, 150);
  };

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentWord) return;
    const utterance = new SpeechSynthesisUtterance(currentWord.nativeText);
    utterance.lang = 'te-IN';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const flipCard = () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    
    // Feature request: tap the card to reveal the answer and hear the pronunciation again.
    if (nextFlipped && currentWord) {
      const utterance = new SpeechSynthesisUtterance(currentWord.nativeText);
      utterance.lang = 'te-IN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRate = (quality: number) => {
    if (currentWord) {
      updateSrsWord(currentWord, quality);
    }
    nextCard();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-md mx-auto flex flex-col items-center"
    >
      {/* Category Selector Dropdown */}
      <div className="w-full px-4 mb-6">
        <label className="block text-xs font-extrabold text-orange-600 uppercase tracking-wider mb-2 text-center">
          Choose Category 📚
        </label>
        <div className="relative">
          <select 
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full p-4 pl-5 pr-10 rounded-2xl bg-white/95 text-blue-900 font-extrabold shadow-lg border-3 border-orange-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none cursor-pointer appearance-none text-center hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-orange-500">
            <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>

      {!currentWord ? (
        <div className="text-xl font-bold text-blue-900 bg-white p-8 rounded-3xl shadow-lg border-4 border-orange-100 text-center w-full max-w-sm my-8">
          <span className="text-5xl mb-4 block">🐅</span>
          No words found in this category. Try another one!
        </div>
      ) : (
        <>
          <div className="flex w-full justify-between items-center mb-8 px-4 text-blue-900 font-bold">
            <span>Word {currentIndex + 1} of {vocab.length}</span>
            <div className="flex gap-1">
              {vocab.map((_, i) => (
                <div key={i} className={`h-3 w-3 rounded-full ${i === currentIndex ? 'bg-orange-500' : 'bg-orange-200'}`} />
              ))}
            </div>
          </div>

          <div 
            className="w-full aspect-[4/5] perspective-1000 cursor-pointer group"
            onClick={flipCard}
          >
            <motion.div
              className="w-full h-full relative preserve-3d"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front */}
              <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-2xl border-4 border-orange-100 flex flex-col items-center justify-center p-6 gap-6" style={{ backfaceVisibility: 'hidden' }}>
                <span className="text-7xl">{currentWord.emoji}</span>
                <h1 className="text-6xl md:text-7xl font-bold text-gray-800 text-center leading-tight">{currentWord.nativeText}</h1>
                <p className="text-gray-400 font-medium">Tap to flip</p>
                
                <button 
                  onClick={playAudio}
                  className="absolute top-4 right-4 p-4 bg-orange-100 text-orange-500 rounded-full hover:bg-orange-200 transition-colors"
                >
                  <Volume2 size={24} />
                </button>
              </div>

              {/* Back */}
              <div 
                className="absolute w-full h-full backface-hidden bg-orange-500 rounded-3xl shadow-2xl border-4 border-orange-400 flex flex-col items-center justify-center p-6 text-white gap-4"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <span className="text-5xl">{currentWord.emoji}</span>
                <h2 className="text-4xl md:text-5xl font-bold text-center">{currentWord.pronunciation}</h2>
                <div className="w-16 h-2 bg-yellow-300 rounded-full my-2"></div>
                <h3 className="text-3xl md:text-4xl font-bold capitalize text-yellow-300 text-center">{currentWord.english}</h3>
                <p className="text-orange-200 font-medium mt-auto">Tap to flip back</p>
              </div>
            </motion.div>
          </div>

          {isFlipped ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 mt-8 w-full justify-center px-4"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); handleRate(1); }}
                className="flex flex-col items-center p-3 bg-red-100 text-red-600 rounded-2xl shadow-sm hover:bg-red-200 active:scale-95 transition-all w-24"
              >
                <Frown size={28} className="mb-1" />
                <span className="font-bold text-sm">Forgot</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleRate(3); }}
                className="flex flex-col items-center p-3 bg-yellow-100 text-yellow-600 rounded-2xl shadow-sm hover:bg-yellow-200 active:scale-95 transition-all w-24"
              >
                <Smile size={28} className="mb-1" />
                <span className="font-bold text-sm">Hard</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleRate(5); }}
                className="flex flex-col items-center p-3 bg-green-100 text-green-600 rounded-2xl shadow-sm hover:bg-green-200 active:scale-95 transition-all w-24"
              >
                <Star size={28} className="mb-1 fill-current" />
                <span className="font-bold text-sm">Easy</span>
              </button>
            </motion.div>
          ) : (
            <div className="flex gap-6 mt-12 w-full max-w-sm justify-between px-4">
              <button 
                onClick={prevCard}
                className="p-4 bg-white text-blue-900 rounded-full shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                onClick={nextCard}
                className="p-4 bg-white text-blue-900 rounded-full shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
              >
                <ChevronRight size={32} />
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
