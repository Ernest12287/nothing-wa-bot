// ============================================
// BRAIN/BIBLE — CHAPTER HANDLER
// Returns data. No formatting, no sending.
// ============================================

import Bible from './bible.js';

export function chapterHandler(book, chapter, translation = 'KJV') {
    return Bible.getChapter(book, chapter, translation);
}