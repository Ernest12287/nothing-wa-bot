// ============================================
// BRAIN/BIBLE — SEARCH HANDLER
// Returns data. No formatting, no sending.
// ============================================

import Bible from './bible.js';

export function searchHandler(keyword, translation = 'KJV', limit = 10) {
    if (!keyword?.trim()) return [];
    return Bible.search(keyword, translation, limit);
}