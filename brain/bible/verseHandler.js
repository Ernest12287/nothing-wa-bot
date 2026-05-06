// ============================================
// BRAIN/BIBLE — VERSE HANDLER
// Returns data. No formatting, no sending.
// ============================================

import Bible from './bible.js';

export function verseHandler(book, chapter, verse, translation = 'KJV') {
    return Bible.getVerse(book, chapter, verse, translation);
}

export function verseBoth(book, chapter, verse) {
    return Bible.getVerseBoth(book, chapter, verse);
}

export function resolveBook(input) {
    return Bible.resolveBook(input);
}