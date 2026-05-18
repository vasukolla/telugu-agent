import { VocabWord } from '../types';

export interface SrsData extends VocabWord {
  repetitions: number;
  interval: number; // in days
  easeFactor: number;
  nextReviewDate: number; // timestamp
}

export function getSrsData(): Record<string, SrsData> {
  const data = localStorage.getItem('telugu_lingo_srs');
  return data ? JSON.parse(data) : {};
}

export function saveSrsData(data: Record<string, SrsData>) {
  localStorage.setItem('telugu_lingo_srs', JSON.stringify(data));
}

// SuperMemo-2 style algorithm
// quality: 0 (forgot) to 5 (perfect recall)
export function updateSrsWord(word: VocabWord, quality: number) {
  const data = getSrsData();
  const existing = data[word.nativeText] || {
    ...word,
    repetitions: 0,
    interval: 0,
    easeFactor: 2.5,
    nextReviewDate: Date.now()
  };

  let { repetitions, interval, easeFactor } = existing;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect response
    repetitions = 0;
    interval = 1;
  }

  // Adjust ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3; // Minimum ease

  // For testing/immediate review, if quality is 0 we'll give it an interval of 0.01 days (~15 mins)
  if (quality < 3) {
      interval = 0.01;
  }

  const nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000;

  data[word.nativeText] = {
    ...word,
    repetitions,
    interval,
    easeFactor,
    nextReviewDate
  };

  saveSrsData(data);
}

export function getDueWords(limit: number): SrsData[] {
  const data = getSrsData();
  const now = Date.now();
  const due = Object.values(data).filter(w => w.nextReviewDate <= now);
  due.sort((a, b) => a.nextReviewDate - b.nextReviewDate); // oldest first
  return due.slice(0, limit);
}
