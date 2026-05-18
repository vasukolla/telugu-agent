import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Volume2, BookOpen, BrainCircuit } from 'lucide-react';
import GrammarQuiz from './GrammarQuiz';

interface GrammarLesson {
  id: string;
  title: string;
  titleNative: string;
  description: string;
  items: {
    nativeText: string;
    pronunciation: string;
    english: string;
    explanation?: string;
  }[];
}

const lessons: GrammarLesson[] = [
  {
    id: 'pronouns',
    title: 'Pronouns',
    titleNative: 'సర్వనామాలు',
    description: 'Learn how to say I, you, he, she, and it.',
    items: [
      { nativeText: 'నేను', pronunciation: 'nenu', english: 'I', explanation: 'Used to refer to oneself.' },
      { nativeText: 'నువ్వు', pronunciation: 'nuvvu', english: 'You (informal)', explanation: 'Used for friends or younger people.' },
      { nativeText: 'మీరు', pronunciation: 'meeru', english: 'You (formal/plural)', explanation: 'Used for elders or multiple people.' },
      { nativeText: 'అతను / వాడు', pronunciation: 'atanu / vaadu', english: 'He', explanation: 'Atanu (formal), Vaadu (informal).' },
      { nativeText: 'ఆమె', pronunciation: 'aame', english: 'She', explanation: 'Used for females.' },
      { nativeText: 'అది', pronunciation: 'adi', english: 'It / That', explanation: 'Used for animals or objects.' },
    ]
  },
  {
    id: 'verbs',
    title: 'Verbs, Tense & Gender',
    titleNative: 'క్రియలు',
    description: 'Learn verb forms differentiated by tense and gender.',
    items: [
      { nativeText: 'తిన్నాడు', pronunciation: 'tinnāḍu', english: 'He ate', explanation: '(tinu - eat) Past, Masculine.' },
      { nativeText: 'తిన్నది', pronunciation: 'tinnadi', english: 'She/It ate', explanation: '(tinu - eat) Past, Feminine/Neuter.' },
      { nativeText: 'తింటున్నాడు', pronunciation: 'tiṇṭunnāḍu', english: 'He is eating', explanation: '(tinu - eat) Present, Masculine.' },
      { nativeText: 'తింటుంది', pronunciation: 'tiṇṭundi', english: 'She/It is eating', explanation: '(tinu - eat) Present, Feminine/Neuter.' },
      { nativeText: 'తింటాడు', pronunciation: 'tiṇṭāḍu', english: 'He will eat', explanation: '(tinu - eat) Future, Masculine.' },
      { nativeText: 'తింటుంది', pronunciation: 'tiṇṭundi', english: 'She/It will eat', explanation: '(tinu - eat) Future, Feminine/Neuter.' },
      { nativeText: 'తాగాడు', pronunciation: 'tāgāḍu', english: 'He drank', explanation: '(tāgu - drink) Past, Masculine.' },
      { nativeText: 'తాగింది', pronunciation: 'tāgindi', english: 'She/It drank', explanation: '(tāgu - drink) Past, Feminine/Neuter.' },
      { nativeText: 'తాగుతున్నాడు', pronunciation: 'tāgutunnāḍu', english: 'He is drinking', explanation: '(tāgu - drink) Present, Masculine.' },
      { nativeText: 'తాగుతుంది', pronunciation: 'tāgutundi', english: 'She/It is drinking', explanation: '(tāgu - drink) Present, Feminine/Neuter.' },
      { nativeText: 'తాగుతాడు', pronunciation: 'tāgutāḍu', english: 'He will drink', explanation: '(tāgu - drink) Future, Masculine.' },
      { nativeText: 'తాగుతుంది', pronunciation: 'tāgutundi', english: 'She/It will drink', explanation: '(tāgu - drink) Future, Feminine/Neuter.' },
      { nativeText: 'ఆడాడు', pronunciation: 'āḍāḍu', english: 'He played', explanation: '(āḍu - play) Past, Masculine.' },
      { nativeText: 'ఆడింది', pronunciation: 'āḍindi', english: 'She/It played', explanation: '(āḍu - play) Past, Feminine/Neuter.' },
      { nativeText: 'ఆడుతున్నాడు', pronunciation: 'āḍutunnāḍu', english: 'He is playing', explanation: '(āḍu - play) Present, Masculine.' },
      { nativeText: 'ఆడుతుంది', pronunciation: 'āḍutundi', english: 'She/It is playing', explanation: '(āḍu - play) Present, Feminine/Neuter.' },
      { nativeText: 'ఆడుతాడు', pronunciation: 'āḍutāḍu', english: 'He will play', explanation: '(āḍu - play) Future, Masculine.' },
      { nativeText: 'ఆడుతుంది', pronunciation: 'āḍutundi', english: 'She/It will play', explanation: '(āḍu - play) Future, Feminine/Neuter.' },
      { nativeText: 'పడుకున్నాడు', pronunciation: 'paḍukunnāḍu', english: 'He slept', explanation: '(paḍukō - sleep) Past, Masculine.' },
      { nativeText: 'పడుకుంది', pronunciation: 'paḍukundi', english: 'She/It slept', explanation: '(paḍukō - sleep) Past, Feminine/Neuter.' },
      { nativeText: 'పడుకుంటున్నాడు', pronunciation: 'paḍukuṇṭunnāḍu', english: 'He is sleeping', explanation: '(paḍukō - sleep) Present, Masculine.' },
      { nativeText: 'పడుకుంటుంది', pronunciation: 'paḍukuṇṭundi', english: 'She/It is sleeping', explanation: '(paḍukō - sleep) Present, Feminine/Neuter.' },
      { nativeText: 'పడుకుంటాడు', pronunciation: 'paḍukuṇṭāḍu', english: 'He will sleep', explanation: '(paḍukō - sleep) Future, Masculine.' },
      { nativeText: 'పడుకుంటుంది', pronunciation: 'paḍukuṇṭundi', english: 'She/It will sleep', explanation: '(paḍukō - sleep) Future, Feminine/Neuter.' },
      { nativeText: 'పరిగెత్తాడు', pronunciation: 'parigettāḍu', english: 'He ran', explanation: '(parigettu - run) Past, Masculine.' },
      { nativeText: 'పరిగెత్తింది', pronunciation: 'parigettindi', english: 'She/It ran', explanation: '(parigettu - run) Past, Feminine/Neuter.' },
      { nativeText: 'పరిగెత్తుతున్నాడు', pronunciation: 'parigettutunnāḍu', english: 'He is running', explanation: '(parigettu - run) Present, Masculine.' },
      { nativeText: 'పరిగెత్తుతుంది', pronunciation: 'parigettutundi', english: 'She/It is running', explanation: '(parigettu - run) Present, Feminine/Neuter.' },
      { nativeText: 'పరిగెత్తుతాడు', pronunciation: 'parigettutāḍu', english: 'He will run', explanation: '(parigettu - run) Future, Masculine.' },
      { nativeText: 'పరిగెత్తుతుంది', pronunciation: 'parigettutundi', english: 'She/It will run', explanation: '(parigettu - run) Future, Feminine/Neuter.' },
      { nativeText: 'చదివాడు', pronunciation: 'chadivāḍu', english: 'He read', explanation: '(chaduve - read / study) Past, Masculine.' },
      { nativeText: 'చదివింది', pronunciation: 'chadivindi', english: 'She/It read', explanation: '(chaduve - read / study) Past, Feminine/Neuter.' },
      { nativeText: 'చదువుతున్నాడు', pronunciation: 'chaduvutunnāḍu', english: 'He is reading', explanation: '(chaduve - read / study) Present, Masculine.' },
      { nativeText: 'చదువుతుంది', pronunciation: 'chaduvutundi', english: 'She/It is reading', explanation: '(chaduve - read / study) Present, Feminine/Neuter.' },
      { nativeText: 'చదువుతాడు', pronunciation: 'chaduvutāḍu', english: 'He will read', explanation: '(chaduve - read / study) Future, Masculine.' },
      { nativeText: 'చదువుతుంది', pronunciation: 'chaduvutundi', english: 'She/It will read', explanation: '(chaduve - read / study) Future, Feminine/Neuter.' },
      { nativeText: 'రాశాడు', pronunciation: 'rāśāḍu', english: 'He wrote', explanation: '(rāyu - write) Past, Masculine.' },
      { nativeText: 'రాసింది', pronunciation: 'rāsindi', english: 'She/It wrote', explanation: '(rāyu - write) Past, Feminine/Neuter.' },
      { nativeText: 'రాస్తున్నాడు', pronunciation: 'rāstunnāḍu', english: 'He is writing', explanation: '(rāyu - write) Present, Masculine.' },
      { nativeText: 'రాస్తుంది', pronunciation: 'rāstundi', english: 'She/It is writing', explanation: '(rāyu - write) Present, Feminine/Neuter.' },
      { nativeText: 'రాస్తాడు', pronunciation: 'rāstāḍu', english: 'He will write', explanation: '(rāyu - write) Future, Masculine.' },
      { nativeText: 'రాస్తుంది', pronunciation: 'rāstundi', english: 'She/It will write', explanation: '(rāyu - write) Future, Feminine/Neuter.' },
      { nativeText: 'నవ్వాడు', pronunciation: 'navvāḍu', english: 'He laughed', explanation: '(navvu - laugh / smile) Past, Masculine.' },
      { nativeText: 'నవ్వింది', pronunciation: 'navvindi', english: 'She/It laughed', explanation: '(navvu - laugh / smile) Past, Feminine/Neuter.' },
      { nativeText: 'నవ్వుతున్నాడు', pronunciation: 'navvutunnāḍu', english: 'He is laughing', explanation: '(navvu - laugh / smile) Present, Masculine.' },
      { nativeText: 'నవ్వుతుంది', pronunciation: 'navvutundi', english: 'She/It is laughing', explanation: '(navvu - laugh / smile) Present, Feminine/Neuter.' },
      { nativeText: 'నవ్వుతాడు', pronunciation: 'navvutāḍu', english: 'He will laugh', explanation: '(navvu - laugh / smile) Future, Masculine.' },
      { nativeText: 'నవ్వుతుంది', pronunciation: 'navvutundi', english: 'She/It will laugh', explanation: '(navvu - laugh / smile) Future, Feminine/Neuter.' },
      { nativeText: 'నడిచాడు', pronunciation: 'naḍicāḍu', english: 'He walked', explanation: '(naḍucu - walk) Past, Masculine.' },
      { nativeText: 'నడిచింది', pronunciation: 'naḍicindi', english: 'She/It walked', explanation: '(naḍucu - walk) Past, Feminine/Neuter.' },
      { nativeText: 'నడుస్తున్నాడు', pronunciation: 'naḍustunnāḍu', english: 'He is walking', explanation: '(naḍucu - walk) Present, Masculine.' },
      { nativeText: 'నడుస్తుంది', pronunciation: 'naḍustundi', english: 'She/It is walking', explanation: '(naḍucu - walk) Present, Feminine/Neuter.' },
      { nativeText: 'నడుస్తాడు', pronunciation: 'naḍustāḍu', english: 'He will walk', explanation: '(naḍucu - walk) Future, Masculine.' },
      { nativeText: 'నడుస్తుంది', pronunciation: 'naḍustundi', english: 'She/It will walk', explanation: '(naḍucu - walk) Future, Feminine/Neuter.' },
      { nativeText: 'చూశాడు', pronunciation: 'chūśāḍu', english: 'He saw', explanation: '(chūḍu - see / watch) Past, Masculine.' },
      { nativeText: 'చూసింది', pronunciation: 'chūsindi', english: 'She/It saw', explanation: '(chūḍu - see / watch) Past, Feminine/Neuter.' },
      { nativeText: 'చూస్తున్నాడు', pronunciation: 'chūstunnāḍu', english: 'He is watching', explanation: '(chūḍu - see / watch) Present, Masculine.' },
      { nativeText: 'చూస్తుంది', pronunciation: 'chūstundi', english: 'She/It is watching', explanation: '(chūḍu - see / watch) Present, Feminine/Neuter.' },
      { nativeText: 'చూస్తాడు', pronunciation: 'chūstāḍu', english: 'He will see', explanation: '(chūḍu - see / watch) Future, Masculine.' },
      { nativeText: 'చూస్తుంది', pronunciation: 'chūstundi', english: 'She/It will see', explanation: '(chūḍu - see / watch) Future, Feminine/Neuter.' }
    ]
  },
  {
    id: 'gender',
    title: 'Gender',
    titleNative: 'లింగం',
    description: 'In Telugu, words are often categorized by gender.',
    items: [
      { nativeText: 'అబ్బాయి', pronunciation: 'abbaayi', english: 'Boy', explanation: 'Masculine gender.' },
      { nativeText: 'అమ్మాయి', pronunciation: 'ammaayi', english: 'Girl', explanation: 'Feminine gender.' },
      { nativeText: 'మగ', pronunciation: 'maga', english: 'Male', explanation: 'Used to denote male animals/things.' },
      { nativeText: 'ఆడ', pronunciation: 'aada', english: 'Female', explanation: 'Used to denote female animals/things.' },
      { nativeText: 'వాడు వచ్చాడు', pronunciation: 'Vaadu vacchaadu', english: 'He came', explanation: 'Verb ending "-adu" for masculine.' },
      { nativeText: 'ఆమె వచ్చింది', pronunciation: 'Aame vacchindi', english: 'She came', explanation: 'Verb ending "-indi" for feminine/neuter.' },
    ]
  },
  {
    id: 'numbers',
    title: 'Numbers',
    titleNative: 'అంకెలు',
    description: 'Learn to count up to 20.',
    items: [
      { nativeText: 'ఒకటి', pronunciation: 'okati', english: 'One', explanation: 'Number 1.' },
      { nativeText: 'రెండు', pronunciation: 'rendu', english: 'Two', explanation: 'Number 2.' },
      { nativeText: 'మూడు', pronunciation: 'moodu', english: 'Three', explanation: 'Number 3.' },
      { nativeText: 'నాలుగు', pronunciation: 'naalugu', english: 'Four', explanation: 'Number 4.' },
      { nativeText: 'ఐదు', pronunciation: 'aidu', english: 'Five', explanation: 'Number 5.' },
      { nativeText: 'ఆరు', pronunciation: 'aaru', english: 'Six', explanation: 'Number 6.' },
      { nativeText: 'ఏడు', pronunciation: 'edu', english: 'Seven', explanation: 'Number 7.' },
      { nativeText: 'ఎనిమిది', pronunciation: 'enimidi', english: 'Eight', explanation: 'Number 8.' },
      { nativeText: 'తొమ్మిది', pronunciation: 'tommidi', english: 'Nine', explanation: 'Number 9.' },
      { nativeText: 'పది', pronunciation: 'padi', english: 'Ten', explanation: 'Number 10.' },
      { nativeText: 'పదకొండు', pronunciation: 'padakondu', english: 'Eleven', explanation: 'Number 11.' },
      { nativeText: 'పన్నెండు', pronunciation: 'pannendu', english: 'Twelve', explanation: 'Number 12.' },
      { nativeText: 'పదమూడు', pronunciation: 'padamoodu', english: 'Thirteen', explanation: 'Number 13.' },
      { nativeText: 'పద్నాలుగు', pronunciation: 'padnaalugu', english: 'Fourteen', explanation: 'Number 14.' },
      { nativeText: 'పదిహేను', pronunciation: 'padihenu', english: 'Fifteen', explanation: 'Number 15.' },
      { nativeText: 'పదహారు', pronunciation: 'padahaaru', english: 'Sixteen', explanation: 'Number 16.' },
      { nativeText: 'పదిహేడు', pronunciation: 'padihedu', english: 'Seventeen', explanation: 'Number 17.' },
      { nativeText: 'పద్దెనిమిది', pronunciation: 'paddenimidi', english: 'Eighteen', explanation: 'Number 18.' },
      { nativeText: 'పంతొమ్మిది', pronunciation: 'pantommidi', english: 'Nineteen', explanation: 'Number 19.' },
      { nativeText: 'ఇరవై', pronunciation: 'iravai', english: 'Twenty', explanation: 'Number 20.' },
    ]
  }
];

export default function GrammarApp() {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isQuizMode, setIsQuizMode] = useState(false);

  const selectedLesson = lessons.find(l => l.id === selectedLessonId);

  const playAudio = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'te-IN';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  if (isQuizMode && selectedLesson) {
    return (
      <GrammarQuiz 
        lessonTitle={selectedLesson.title}
        items={selectedLesson.items}
        onClose={() => setIsQuizMode(false)}
      />
    );
  }

  if (!selectedLesson) {
    return (
      <div className="w-full max-w-4xl flex flex-col items-center">
        <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center flex items-center gap-3">
          <BookOpen className="text-blue-500" size={32} />
          Telugu Grammar
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {lessons.map((lesson, idx) => (
            <motion.button
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedLessonId(lesson.id)}
              className="bg-white p-6 rounded-3xl shadow-lg border-2 border-blue-100 flex flex-col items-start text-left hover:border-blue-300 transition-colors"
            >
              <h3 className="text-2xl font-bold text-blue-800 mb-1">{lesson.title}</h3>
              <p className="text-lg text-blue-600 mb-4">{lesson.titleNative}</p>
              <p className="text-gray-600 outline-none">{lesson.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl flex flex-col items-center">
      <button 
        onClick={() => setSelectedLessonId(null)}
        className="self-start mb-6 text-blue-600 hover:text-blue-800 flex items-center font-bold"
      >
        <ChevronLeft size={20} /> Back to Lessons
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-blue-100"
      >
        <div className="text-center mb-8 border-b-2 border-gray-100 pb-6">
          <h2 className="text-3xl font-extrabold text-blue-900 mb-2">{selectedLesson.title}</h2>
          <p className="text-xl text-blue-600 font-medium">{selectedLesson.titleNative}</p>
          <p className="text-gray-500 mt-2 mb-6">{selectedLesson.description}</p>
          
          {selectedLesson.id === 'pronouns' && (
            <button 
              onClick={() => setIsQuizMode(true)}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-6 py-3 rounded-xl font-bold transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <BrainCircuit size={20} />
              Take Pronouns Quiz
            </button>
          )}
        </div>

        <div className="space-y-4">
          {selectedLesson.items.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-blue-50/50 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-100 hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={() => playAudio(item.nativeText)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-2xl font-bold text-gray-800">{item.nativeText}</h4>
                  <button 
                    onClick={(e) => playAudio(item.nativeText, e)}
                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors"
                  >
                    <Volume2 size={20} />
                  </button>
                </div>
                <p className="text-lg text-purple-600 font-medium">{item.pronunciation}</p>
              </div>
              <div className="flex-1 sm:text-right border-t sm:border-t-0 sm:border-l border-blue-200 pt-3 sm:pt-0 sm:pl-4 mt-3 sm:mt-0">
                <p className="text-xl font-bold text-gray-800">{item.english}</p>
                {item.explanation && (
                  <p className="text-sm text-gray-500 mt-1">{item.explanation}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
