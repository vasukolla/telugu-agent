import React from 'react';
import { AppMode, VocabWord } from '../types';
import { Play, FileText, Mic, ArrowLeft, Star, BookOpen, Library } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  onSelectMode: (mode: AppMode) => void;
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
            <motion.button
              key={mode.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectMode(mode.id as AppMode)}
              className={`${mode.color} ${mode.hoverColor} text-white p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center gap-4 transition-colors border-4 border-white border-opacity-30 relative overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon size={120} />
              </div>
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                <Icon size={48} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold">{mode.title}</h2>
            </motion.button>
          )
        })}
      </div>
    </div>
  );
}
