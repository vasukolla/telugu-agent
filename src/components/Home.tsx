import React from 'react';
import { AppMode, VocabWord } from '../types';
import { Play, FileText, Mic, ArrowLeft, Star, BookOpen, Library } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  onSelectMode: (mode: AppMode, category?: string) => void;
}

export default function Home({ onSelectMode }: HomeProps) {
  const modes = [
    { id: 'read', title: 'Words', icon: FileText, color: 'bg-orange-400', hoverColor: 'hover:bg-orange-500' },
    { id: 'speak', title: 'Speaking', icon: Mic, color: 'bg-green-400', hoverColor: 'hover:bg-green-500' },
    { id: 'story', title: 'Stories', icon: BookOpen, color: 'bg-purple-400', hoverColor: 'hover:bg-purple-500' },
    { id: 'grammar', title: 'Grammar', icon: Library, color: 'bg-red-400', hoverColor: 'hover:bg-red-500' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-12"
      >
        <div className="inline-block p-4 bg-yellow-300 rounded-full mb-4 shadow-lg border-4 border-yellow-400">
          <span className="text-6xl">🐅</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-2 drop-shadow-sm font-sans tracking-tight">Telugu</h1>
        <p className="text-xl text-blue-700 font-medium">Let's learn Telugu together!</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
        {modes.map((mode, index) => {
          const Icon = mode.icon;
          return (
            <motion.div
              key={mode.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectMode(mode.id as AppMode)}
                className={`${mode.color} ${mode.hoverColor} w-full text-white p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center gap-4 transition-colors border-4 border-white border-opacity-30 relative overflow-hidden group flex-grow`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icon size={120} />
                </div>
                <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                  <Icon size={48} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold">{mode.title}</h2>
              </motion.button>
              
              {mode.id === 'read' && (
                <div className="relative mt-2">
                  <select 
                    className="w-full p-3 pl-4 pr-8 rounded-2xl bg-white/90 text-blue-900 font-bold shadow-md border-2 border-orange-300 focus:border-orange-500 outline-none cursor-pointer appearance-none text-center hover:bg-white transition-colors"
                    onChange={(e) => {
                      if (e.target.value) {
                        onSelectMode('read', e.target.value);
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select Category...</option>
                    <option value="animals">Animals</option>
                    <option value="colors">Colors</option>
                    <option value="numbers">Numbers</option>
                    <option value="fruits">Fruits</option>
                    <option value="family members">Family</option>
                    <option value="body parts">Body Parts</option>
                    <option value="nature">Nature</option>
                    <option value="food">Food</option>
                    <option value="weather">Weather</option>
                    <option value="clothes">Clothes</option>
                    <option value="emotions">Emotions</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-orange-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  );
}
