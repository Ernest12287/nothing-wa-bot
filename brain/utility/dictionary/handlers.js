import { defineWord } from './dictionary.js';

export async function dictionaryHandler(word) {
    if (!word?.trim()) throw new Error('Provide a word to define.');
    return await defineWord(word.trim().toLowerCase());
}