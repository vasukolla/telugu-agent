import { VocabWord, Story } from '../types';

export async function fetchDailyVocab(): Promise<VocabWord[]> {
  try {
    const response = await fetch('/api/vocab');
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data.vocab;
  } catch (error) {
    console.error("Failed to fetch vocab:", error);
    return [];
  }
}

export async function fetchStories(): Promise<Story[]> {
  try {
    const response = await fetch('/api/stories');
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data.stories;
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    return [];
  }
}
