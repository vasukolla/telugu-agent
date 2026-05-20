export interface VocabWord {
  nativeText: string;
  pronunciation: string;
  english: string;
  emoji: string;
  category?: string;
}

export interface StorySentence {
  nativeText: string;
  pronunciation: string;
  english: string;
}

export interface Story {
  id: string;
  title: string;
  titlePronunciation: string;
  titleEnglish: string;
  sentences: StorySentence[];
  emoji: string;
}

export type AppMode = 'home' | 'read' | 'speak' | 'story' | 'grammar';
