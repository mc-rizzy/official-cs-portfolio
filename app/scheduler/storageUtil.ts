// storageUtils.ts

const STORAGE_KEY = 'canvas_blocks_data';

export const saveBlocksToStorage = <T>(blocks: T): void => {
  try {
    const jsonString = JSON.stringify(blocks);
    localStorage.setItem(STORAGE_KEY, jsonString);
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadBlocksFromStorage = <T>(fallbackValue: T): T => {
  if (typeof window === 'undefined') return fallbackValue; // SSR check for Next.js

  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : fallbackValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return fallbackValue;
  }
};