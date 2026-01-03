import { Book, BookNode } from '../types';

export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
};

export const getLexicalDiversity = (text: string): number => {
  const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
  if (words.length === 0) return 0;
  const uniqueWords = new Set(words);
  return uniqueWords.size / words.length;
};

export const getSentenceMetrics = (text: string) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return { avg: 0, distribution: [] };
  
  const lengths = sentences.map(s => countWords(s));
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  return { avg, lengths };
};

export const calculateReadability = (text: string) => {
  const words = countWords(text);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  if (words === 0 || sentences === 0) return 0;
  // Basic proxy for complexity: Avg sentence length
  return words / sentences;
};

export const getPacingData = (nodes: BookNode[]) => {
  return nodes.map(n => ({
    title: n.title,
    wordCount: countWords(n.content)
  }));
};

export const getProjections = (book: Book) => {
  const currentWords = book.nodes.reduce((acc, n) => acc + countWords(n.content), 0);
  const target = book.targetWordCount || 50000;
  const remaining = Math.max(0, target - currentWords);
  
  // Calculate average words per day from history
  const recentHistory = book.history.slice(-7);
  const avgPerDay = recentHistory.length > 0 
    ? recentHistory.reduce((acc, h) => acc + h.netWords, 0) / recentHistory.length
    : 0;

  const daysToFinish = avgPerDay > 0 ? Math.ceil(remaining / avgPerDay) : Infinity;
  
  return {
    currentWords,
    target,
    remaining,
    avgPerDay,
    daysToFinish,
    percentComplete: (currentWords / target) * 100
  };
};