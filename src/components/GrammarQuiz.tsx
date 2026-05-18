import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Check, X, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizItem {
  nativeText: string;
  pronunciation: string;
  english: string;
  explanation?: string;
}

interface GrammarQuizProps {
  lessonTitle: string;
  items: QuizItem[];
  onClose: () => void;
}

export default function GrammarQuiz({ lessonTitle, items, onClose }: GrammarQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Shuffle the quiz items to create questions
  const questions = useMemo(() => {
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    return shuffledItems.map((item) => {
      // Pick 3 random wrong options
      const wrongOptions = items
        .filter((i) => i.nativeText !== item.nativeText)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const allOptions = [...wrongOptions, item].sort(() => Math.random() - 0.5);
      
      return {
        questionItem: item,
        options: allOptions,
        correctIndex: allOptions.findIndex((o) => o.nativeText === item.nativeText),
      };
    });
  }, [items]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctIndex) {
      setScore((s) => s + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#22c55e', '#fef08a']
      });
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((curr) => curr + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      if (score === questions.length - 1) {
          // If they got everything right except maybe 1 or 0 wrong
           confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
          });
      }
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  if (showResult) {
    return (
      <div className="w-full max-w-2xl flex flex-col items-center">
        <button 
          onClick={onClose}
          className="self-start mb-6 text-blue-600 hover:text-blue-800 flex items-center font-bold"
        >
          <ChevronLeft size={20} /> Back to Lessons
        </button>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-white rounded-3xl p-8 shadow-xl border-4 border-blue-100 text-center"
        >
          <h2 className="text-4xl font-bold text-blue-900 mb-6">Quiz Finished!</h2>
          <p className="text-2xl text-gray-700 mb-8">
            You scored <span className="font-bold text-blue-600">{score}</span> out of {questions.length}
          </p>
          
          <div className="flex gap-4 justify-center">
            <button 
              onClick={restartQuiz}
              className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={20} /> Try Again
            </button>
            <button 
              onClick={onClose}
              className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      <button 
        onClick={onClose}
        className="self-start mb-6 text-blue-600 hover:text-blue-800 flex items-center font-bold"
      >
        <ChevronLeft size={20} /> Quit Quiz
      </button>

      <motion.div 
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full bg-white rounded-3xl p-8 shadow-xl border-4 border-blue-100"
      >
        <div className="mb-8 text-center">
          <p className="text-blue-500 font-bold mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
          <h2 className="text-3xl font-extrabold text-blue-900 mb-2">What is the Telugu for:</h2>
          <p className="text-4xl font-bold text-purple-600 mt-4">{currentQuestion.questionItem.english}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => {
            let buttonClass = "bg-blue-50 border-2 border-blue-100 hover:bg-blue-100 text-gray-800";
            let OptionIcon = null;

            if (isAnswered) {
              if (index === currentQuestion.correctIndex) {
                buttonClass = "bg-green-100 border-2 border-green-500 text-green-800";
                OptionIcon = Check;
              } else if (index === selectedOption) {
                buttonClass = "bg-red-100 border-2 border-red-500 text-red-800";
                OptionIcon = X;
              } else {
                buttonClass = "bg-gray-50 border-2 border-gray-200 text-gray-400 opacity-50";
              }
            }

            return (
              <motion.button
                key={index}
                whileHover={!isAnswered ? { scale: 1.02 } : {}}
                whileTap={!isAnswered ? { scale: 0.98 } : {}}
                onClick={() => handleOptionClick(index)}
                disabled={isAnswered}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${buttonClass}`}
              >
                <div className="flex items-center gap-2">
                  {OptionIcon && <OptionIcon size={20} className={index === currentQuestion.correctIndex ? "text-green-600" : "text-red-600"} />}
                  <span className="text-2xl font-bold">{option.nativeText}</span>
                </div>
                <span className="text-sm font-medium opacity-80">{option.pronunciation}</span>
              </motion.button>
            );
          })}
        </div>

        {isAnswered && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-end"
          >
            <button 
              onClick={nextQuestion}
              className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
