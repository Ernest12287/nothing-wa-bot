// ============================================
// BIBLE LIBRARY
// All 66 books | KJV + GNT | Local JSON files
//
// FOLDER STRUCTURE EXPECTED:
//   lib/bible/data/KJV/Genesis.json
//   lib/bible/data/KJV/Exodus.json
//   lib/bible/data/GNT/Genesis.json
//   ... etc
//
// Usage:
//   import Bible from '../lib/bible/bible.js';
//   const verse = Bible.getVerse('John', 3, 16);
//   const chapter = Bible.getChapter('Psalms', 23);
//   const random = Bible.getRandomVerse();
//   const results = Bible.search('love one another');
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// This tells the script to look two levels up from brain/bible to find the root 'data' folder
const DATA_DIR = path.join(__dirname, '..', '..', 'data');

// ── In-memory cache so we don't read disk every call ──
const cache = { KJV: {}, GNT: {} };

// ── Book name aliases (so users can type any variation) ──
const ALIASES = {
    'gen': 'Genesis', 'genesis': 'Genesis',
    'exod': 'Exodus', 'exo': 'Exodus', 'exodus': 'Exodus',
    'lev': 'Leviticus', 'leviticus': 'Leviticus',
    'num': 'Numbers', 'numbers': 'Numbers',
    'deut': 'Deuteronomy', 'deu': 'Deuteronomy', 'deuteronomy': 'Deuteronomy',
    'josh': 'Joshua', 'joshua': 'Joshua',
    'judg': 'Judges', 'jdg': 'Judges', 'judges': 'Judges',
    'ruth': 'Ruth',
    '1sam': '1 Samuel', '1samuel': '1 Samuel', '1 samuel': '1 Samuel',
    '2sam': '2 Samuel', '2samuel': '2 Samuel', '2 samuel': '2 Samuel',
    '1kgs': '1 Kings', '1kings': '1 Kings', '1 kings': '1 Kings',
    '2kgs': '2 Kings', '2kings': '2 Kings', '2 kings': '2 Kings',
    '1chr': '1 Chronicles', '1chronicles': '1 Chronicles', '1 chronicles': '1 Chronicles',
    '2chr': '2 Chronicles', '2chronicles': '2 Chronicles', '2 chronicles': '2 Chronicles',
    'ezra': 'Ezra',
    'neh': 'Nehemiah', 'nehemiah': 'Nehemiah',
    'esth': 'Esther', 'esther': 'Esther',
    'job': 'Job',
    'ps': 'Psalms', 'psa': 'Psalms', 'psalm': 'Psalms', 'psalms': 'Psalms',
    'prov': 'Proverbs', 'pro': 'Proverbs', 'proverbs': 'Proverbs',
    'eccl': 'Ecclesiastes', 'ecc': 'Ecclesiastes', 'ecclesiastes': 'Ecclesiastes',
    'song': 'Song of Solomon', 'sos': 'Song of Solomon', 'song of solomon': 'Song of Solomon',
    'isa': 'Isaiah', 'isaiah': 'Isaiah',
    'jer': 'Jeremiah', 'jeremiah': 'Jeremiah',
    'lam': 'Lamentations', 'lamentations': 'Lamentations',
    'ezek': 'Ezekiel', 'eze': 'Ezekiel', 'ezekiel': 'Ezekiel',
    'dan': 'Daniel', 'daniel': 'Daniel',
    'hos': 'Hosea', 'hosea': 'Hosea',
    'joel': 'Joel',
    'amos': 'Amos',
    'obad': 'Obadiah', 'obadiah': 'Obadiah',
    'jonah': 'Jonah', 'jon': 'Jonah',
    'mic': 'Micah', 'micah': 'Micah',
    'nah': 'Nahum', 'nahum': 'Nahum',
    'hab': 'Habakkuk', 'habakkuk': 'Habakkuk',
    'zeph': 'Zephaniah', 'zephaniah': 'Zephaniah',
    'hag': 'Haggai', 'haggai': 'Haggai',
    'zech': 'Zechariah', 'zechariah': 'Zechariah',
    'mal': 'Malachi', 'malachi': 'Malachi',
    'matt': 'Matthew', 'mat': 'Matthew', 'matthew': 'Matthew',
    'mark': 'Mark', 'mrk': 'Mark',
    'luke': 'Luke', 'luk': 'Luke',
    'john': 'John', 'jhn': 'John',
    'acts': 'Acts',
    'rom': 'Romans', 'romans': 'Romans',
    '1cor': '1 Corinthians', '1corinthians': '1 Corinthians', '1 corinthians': '1 Corinthians',
    '2cor': '2 Corinthians', '2corinthians': '2 Corinthians', '2 corinthians': '2 Corinthians',
    'gal': 'Galatians', 'galatians': 'Galatians',
    'eph': 'Ephesians', 'ephesians': 'Ephesians',
    'phil': 'Philippians', 'philippians': 'Philippians',
    'col': 'Colossians', 'colossians': 'Colossians',
    '1thess': '1 Thessalonians', '1thessalonians': '1 Thessalonians', '1 thessalonians': '1 Thessalonians',
    '2thess': '2 Thessalonians', '2thessalonians': '2 Thessalonians', '2 thessalonians': '2 Thessalonians',
    '1tim': '1 Timothy', '1timothy': '1 Timothy', '1 timothy': '1 Timothy',
    '2tim': '2 Timothy', '2timothy': '2 Timothy', '2 timothy': '2 Timothy',
    'titus': 'Titus', 'tit': 'Titus',
    'phlm': 'Philemon', 'philemon': 'Philemon',
    'heb': 'Hebrews', 'hebrews': 'Hebrews',
    'jas': 'James', 'james': 'James',
    '1pet': '1 Peter', '1peter': '1 Peter', '1 peter': '1 Peter',
    '2pet': '2 Peter', '2peter': '2 Peter', '2 peter': '2 Peter',
    '1john': '1 John', '1 john': '1 John',
    '2john': '2 John', '2 john': '2 John',
    '3john': '3 John', '3 john': '3 John',
    'jude': 'Jude',
    'rev': 'Revelation', 'revelation': 'Revelation',
};

const ALL_BOOKS = [
    'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
    '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
    'Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon',
    'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
    'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah',
    'Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians',
    '2 Corinthians','Galatians','Ephesians','Philippians','Colossians',
    '1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon',
    'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
];

// ============================================
// INTERNAL HELPERS
// ============================================

function resolveBookName(input) {
    if (!input) return null;
    const key = input.toLowerCase().trim();
    return ALIASES[key] || null;
}

function loadBook(bookName, translation = 'KJV') {
    const t = translation.toUpperCase();
    if (cache[t][bookName]) return cache[t][bookName];

    const fileName = bookName.replace(/ /g, '_') + '.json';
    const filePath = path.join(DATA_DIR, t, fileName);

    if (!fs.existsSync(filePath)) return null;

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        cache[t][bookName] = data;
        return data;
    } catch (_) {
        return null;
    }
}

// ============================================
// PUBLIC API
// ============================================

const Bible = {

    /**
     * Get a single verse
     * @param {string} book - e.g. 'John', 'jhn', 'ps'
     * @param {number} chapter
     * @param {number} verse
     * @param {string} translation - 'KJV' or 'GNT'
     * @returns {{ book, chapter, verse, text, reference, translation } | null}
     *
     * @example
     * Bible.getVerse('John', 3, 16)
     * Bible.getVerse('ps', 23, 1, 'GNT')
     */
    getVerse(book, chapter, verse, translation = 'KJV') {
        const bookName = resolveBookName(book);
        if (!bookName) return null;

        const data = loadBook(bookName, translation);
        if (!data) return null;

        const text = data.chapters?.[String(chapter)]?.[String(verse)];
        if (!text) return null;

        return {
            book: bookName,
            chapter: Number(chapter),
            verse: Number(verse),
            text,
            reference: `${bookName} ${chapter}:${verse}`,
            translation: translation.toUpperCase()
        };
    },

    /**
     * Get a full chapter as an array of verses
     * @param {string} book
     * @param {number} chapter
     * @param {string} translation
     * @returns {{ book, chapter, verses: [{verse, text}], translation } | null}
     *
     * @example
     * Bible.getChapter('Psalms', 23)
     */
    getChapter(book, chapter, translation = 'KJV') {
        const bookName = resolveBookName(book);
        if (!bookName) return null;

        const data = loadBook(bookName, translation);
        if (!data) return null;

        const chapterData = data.chapters?.[String(chapter)];
        if (!chapterData) return null;

        const verses = Object.entries(chapterData).map(([v, text]) => ({
            verse: Number(v),
            text
        })).sort((a, b) => a.verse - b.verse);

        return {
            book: bookName,
            chapter: Number(chapter),
            verses,
            translation: translation.toUpperCase()
        };
    },

    /**
     * Get a random verse from any book
     * @param {string} translation - 'KJV' or 'GNT'
     * @returns {{ book, chapter, verse, text, reference, translation } | null}
     *
     * @example
     * Bible.getRandomVerse()
     * Bible.getRandomVerse('GNT')
     */
    getRandomVerse(translation = 'KJV') {
        const shuffled = [...ALL_BOOKS].sort(() => Math.random() - 0.5);

        for (const bookName of shuffled) {
            const data = loadBook(bookName, translation);
            if (!data) continue;

            const chapterKeys = Object.keys(data.chapters).filter(ch =>
                Object.keys(data.chapters[ch]).length > 0
            );
            if (!chapterKeys.length) continue;

            const chapter = chapterKeys[Math.floor(Math.random() * chapterKeys.length)];
            const verseKeys = Object.keys(data.chapters[chapter]);
            if (!verseKeys.length) continue;

            const verse = verseKeys[Math.floor(Math.random() * verseKeys.length)];
            const text = data.chapters[chapter][verse];

            return {
                book: bookName,
                chapter: Number(chapter),
                verse: Number(verse),
                text,
                reference: `${bookName} ${chapter}:${verse}`,
                translation: translation.toUpperCase()
            };
        }

        return null;
    },

    /**
     * Get a random verse from a specific book
     * @param {string} book
     * @param {string} translation
     *
     * @example
     * Bible.getRandomVerseFromBook('Psalms')
     * Bible.getRandomVerseFromBook('Proverbs', 'GNT')
     */
    getRandomVerseFromBook(book, translation = 'KJV') {
        const bookName = resolveBookName(book);
        if (!bookName) return null;

        const data = loadBook(bookName, translation);
        if (!data) return null;

        const chapterKeys = Object.keys(data.chapters).filter(ch =>
            Object.keys(data.chapters[ch]).length > 0
        );
        if (!chapterKeys.length) return null;

        const chapter = chapterKeys[Math.floor(Math.random() * chapterKeys.length)];
        const verseKeys = Object.keys(data.chapters[chapter]);
        const verse = verseKeys[Math.floor(Math.random() * verseKeys.length)];
        const text = data.chapters[chapter][verse];

        return {
            book: bookName,
            chapter: Number(chapter),
            verse: Number(verse),
            text,
            reference: `${bookName} ${chapter}:${verse}`,
            translation: translation.toUpperCase()
        };
    },

    /**
     * Search for a keyword across all books
     * @param {string} keyword
     * @param {string} translation
     * @param {number} limit - max results (default 10)
     * @returns {Array<{ book, chapter, verse, text, reference, translation }>}
     *
     * @example
     * Bible.search('love one another')
     * Bible.search('faith', 'GNT', 5)
     */
    search(keyword, translation = 'KJV', limit = 10) {
        if (!keyword?.trim()) return [];

        const results = [];
        const kw = keyword.toLowerCase().trim();

        for (const bookName of ALL_BOOKS) {
            if (results.length >= limit) break;

            const data = loadBook(bookName, translation);
            if (!data) continue;

            for (const [ch, verses] of Object.entries(data.chapters)) {
                if (results.length >= limit) break;

                for (const [v, text] of Object.entries(verses)) {
                    if (text.toLowerCase().includes(kw)) {
                        results.push({
                            book: bookName,
                            chapter: Number(ch),
                            verse: Number(v),
                            text,
                            reference: `${bookName} ${ch}:${v}`,
                            translation: translation.toUpperCase()
                        });
                        if (results.length >= limit) break;
                    }
                }
            }
        }

        return results;
    },

    /**
     * Get a verse in both translations side by side
     * @param {string} book
     * @param {number} chapter
     * @param {number} verse
     * @returns {{ reference, KJV, GNT } | null}
     *
     * @example
     * Bible.getVerseBoth('John', 3, 16)
     */
    getVerseBoth(book, chapter, verse) {
        const kjv = this.getVerse(book, chapter, verse, 'KJV');
        const gnt = this.getVerse(book, chapter, verse, 'GNT');

        if (!kjv && !gnt) return null;

        const ref = kjv?.reference || gnt?.reference;
        return {
            reference: ref,
            KJV: kjv?.text || 'Not available',
            GNT: gnt?.text || 'Not available'
        };
    },

    /**
     * Check how many chapters a book has
     * @param {string} book
     * @param {string} translation
     * @returns {number | null}
     */
    getChapterCount(book, translation = 'KJV') {
        const bookName = resolveBookName(book);
        if (!bookName) return null;
        const data = loadBook(bookName, translation);
        if (!data) return null;
        return Object.keys(data.chapters).length;
    },

    /**
     * Check how many verses are in a chapter
     * @param {string} book
     * @param {number} chapter
     * @param {string} translation
     * @returns {number | null}
     */
    getVerseCount(book, chapter, translation = 'KJV') {
        const bookName = resolveBookName(book);
        if (!bookName) return null;
        const data = loadBook(bookName, translation);
        if (!data) return null;
        const ch = data.chapters?.[String(chapter)];
        return ch ? Object.keys(ch).length : null;
    },

    /**
     * Get list of all 66 book names
     * @returns {string[]}
     */
    getBookList() {
        return [...ALL_BOOKS];
    },

    /**
     * Resolve an alias/abbreviation to full book name
     * @param {string} input
     * @returns {string | null}
     *
     * @example
     * Bible.resolveBook('ps')    // → 'Psalms'
     * Bible.resolveBook('rev')   // → 'Revelation'
     */
    resolveBook(input) {
        return resolveBookName(input);
    },

    /**
     * Check if a book is loaded/available
     * @param {string} book
     * @param {string} translation
     * @returns {boolean}
     */
    isAvailable(book, translation = 'KJV') {
        const bookName = resolveBookName(book);
        if (!bookName) return false;
        const fileName = bookName.replace(/ /g, '_') + '.json';
        return fs.existsSync(path.join(DATA_DIR, translation.toUpperCase(), fileName));
    },

    /**
     * Get stats: how many books are loaded per translation
     * @returns {{ KJV: number, GNT: number }}
     */
    getStats() {
        const count = (t) => {
            const dir = path.join(DATA_DIR, t);
            if (!fs.existsSync(dir)) return 0;
            return fs.readdirSync(dir).filter(f => f.endsWith('.json')).length;
        };
        return { KJV: count('KJV'), GNT: count('GNT') };
    }
};

export default Bible;