import { VocabWord, Story } from '../types';

export async function fetchDailyVocab(category?: string): Promise<VocabWord[]> {
  try {
    const url = category ? `/api/vocab?category=${encodeURIComponent(category)}` : '/api/vocab';
    const response = await fetch(url);
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

export async function submitFeedback(rating: string, comment: string): Promise<boolean> {
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rating, comment }),
    });
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return false;
  }
}
