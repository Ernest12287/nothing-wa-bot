// ============================================
// BRAIN/BIBLE — RANDOM HANDLER
// Returns data. No formatting, no sending.
// ============================================

import Bible from './bible.js';

export function randomVerse(translation = 'KJV') {
    return Bible.getRandomVerse(translation);
}

export function randomVerseFromBook(book, translation = 'KJV') {
    return Bible.getRandomVerseFromBook(book, translation);
}