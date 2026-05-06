// ============================================
// BIBLE DATA FETCHER - SLOW & STEADY VERSION
// Strategy: 1 Chapter -> 4s Pause -> Next Chapter
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BOOKS = [
    { name: "Genesis", abbr: "Gen", chapters: 50, testament: "OT" },
    { name: "Exodus", abbr: "Exod", chapters: 40, testament: "OT" },
    { name: "Leviticus", abbr: "Lev", chapters: 27, testament: "OT" },
    { name: "Numbers", abbr: "Num", chapters: 36, testament: "OT" },
    { name: "Deuteronomy", abbr: "Deut", chapters: 34, testament: "OT" },
    { name: "Joshua", abbr: "Josh", chapters: 24, testament: "OT" },
    { name: "Judges", abbr: "Judg", chapters: 21, testament: "OT" },
    { name: "Ruth", abbr: "Ruth", chapters: 4, testament: "OT" },
    { name: "1 Samuel", abbr: "1Sam", chapters: 31, testament: "OT" },
    { name: "2 Samuel", abbr: "2Sam", chapters: 24, testament: "OT" },
    { name: "1 Kings", abbr: "1Kgs", chapters: 22, testament: "OT" },
    { name: "2 Kings", abbr: "2Kgs", chapters: 25, testament: "OT" },
    { name: "1 Chronicles", abbr: "1Chr", chapters: 29, testament: "OT" },
    { name: "2 Chronicles", abbr: "2Chr", chapters: 36, testament: "OT" },
    { name: "Ezra", abbr: "Ezra", chapters: 10, testament: "OT" },
    { name: "Nehemiah", abbr: "Neh", chapters: 13, testament: "OT" },
    { name: "Esther", abbr: "Esth", chapters: 10, testament: "OT" },
    { name: "Job", abbr: "Job", chapters: 42, testament: "OT" },
    { name: "Psalms", abbr: "Ps", chapters: 150, testament: "OT" },
    { name: "Proverbs", abbr: "Prov", chapters: 31, testament: "OT" },
    { name: "Ecclesiastes", abbr: "Eccl", chapters: 12, testament: "OT" },
    { name: "Song of Solomon", abbr: "Song", chapters: 8, testament: "OT" },
    { name: "Isaiah", abbr: "Isa", chapters: 66, testament: "OT" },
    { name: "Jeremiah", abbr: "Jer", chapters: 52, testament: "OT" },
    { name: "Lamentations", abbr: "Lam", chapters: 5, testament: "OT" },
    { name: "Ezekiel", abbr: "Ezek", chapters: 48, testament: "OT" },
    { name: "Daniel", abbr: "Dan", chapters: 12, testament: "OT" },
    { name: "Hosea", abbr: "Hos", chapters: 14, testament: "OT" },
    { name: "Joel", abbr: "Joel", chapters: 3, testament: "OT" },
    { name: "Amos", abbr: "Amos", chapters: 9, testament: "OT" },
    { name: "Obadiah", abbr: "Obad", chapters: 1, testament: "OT" },
    { name: "Jonah", abbr: "Jonah", chapters: 4, testament: "OT" },
    { name: "Micah", abbr: "Mic", chapters: 7, testament: "OT" },
    { name: "Nahum", abbr: "Nah", chapters: 3, testament: "OT" },
    { name: "Habakkuk", abbr: "Hab", chapters: 3, testament: "OT" },
    { name: "Zephaniah", abbr: "Zeph", chapters: 3, testament: "OT" },
    { name: "Haggai", abbr: "Hag", chapters: 2, testament: "OT" },
    { name: "Zechariah", abbr: "Zech", chapters: 14, testament: "OT" },
    { name: "Malachi", abbr: "Mal", chapters: 4, testament: "OT" },
    { name: "Matthew", abbr: "Matt", chapters: 28, testament: "NT" },
    { name: "Mark", abbr: "Mark", chapters: 16, testament: "NT" },
    { name: "Luke", abbr: "Luke", chapters: 24, testament: "NT" },
    { name: "John", abbr: "John", chapters: 21, testament: "NT" },
    { name: "Acts", abbr: "Acts", chapters: 28, testament: "NT" },
    { name: "Romans", abbr: "Rom", chapters: 16, testament: "NT" },
    { name: "1 Corinthians", abbr: "1Cor", chapters: 16, testament: "NT" },
    { name: "2 Corinthians", abbr: "2Cor", chapters: 13, testament: "NT" },
    { name: "Galatians", abbr: "Gal", chapters: 6, testament: "NT" },
    { name: "Ephesians", abbr: "Eph", chapters: 6, testament: "NT" },
    { name: "Philippians", abbr: "Phil", chapters: 4, testament: "NT" },
    { name: "Colossians", abbr: "Col", chapters: 4, testament: "NT" },
    { name: "1 Thessalonians", abbr: "1Thess", chapters: 5, testament: "NT" },
    { name: "2 Thessalonians", abbr: "2Thess", chapters: 3, testament: "NT" },
    { name: "1 Timothy", abbr: "1Tim", chapters: 6, testament: "NT" },
    { name: "2 Timothy", abbr: "2Tim", chapters: 4, testament: "NT" },
    { name: "Titus", abbr: "Titus", chapters: 3, testament: "NT" },
    { name: "Philemon", abbr: "Phlm", chapters: 1, testament: "NT" },
    { name: "Hebrews", abbr: "Heb", chapters: 13, testament: "NT" },
    { name: "James", abbr: "Jas", chapters: 5, testament: "NT" },
    { name: "1 Peter", abbr: "1Pet", chapters: 5, testament: "NT" },
    { name: "2 Peter", abbr: "2Pet", chapters: 3, testament: "NT" },
    { name: "1 John", abbr: "1John", chapters: 5, testament: "NT" },
    { name: "2 John", abbr: "2John", chapters: 1, testament: "NT" },
    { name: "3 John", abbr: "3John", chapters: 1, testament: "NT" },
    { name: "Jude", abbr: "Jude", chapters: 1, testament: "NT" },
    { name: "Revelation", abbr: "Rev", chapters: 22, testament: "NT" },
];

const TRANSLATIONS = { KJV: 'kjv', GNT: 'web' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchChapter(bookName, chapter, translationCode, maxRetries = 3) {
    const url = `https://bible-api.com/${encodeURIComponent(bookName)}+${chapter}?translation=${translationCode}`;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000); 
            
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (res.status === 429) {
                const waitTime = attempt * 15000; // 15s, 30s...
                console.log(`\n      ⚠️ API Limit Reached. Sleeping ${waitTime/1000}s...`);
                await sleep(waitTime);
                continue;
            }
            
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            const data = await res.json();
            const verses = {};
            for (const v of data.verses || []) {
                verses[String(v.verse)] = v.text.trim();
            }
            return verses;
            
        } catch (error) {
            if (attempt === maxRetries) {
                console.log(`\n      ❌ Chapter ${chapter} failed permanently: ${error.message}`);
                return null;
            }
            await sleep(attempt * 5000);
        }
    }
    return null;
}

async function fetchBook(book, translationName, translationCode, outDir) {
    const fileName = book.name.replace(/ /g, '_') + '.json';
    const filePath = path.join(outDir, fileName);

    let bookData = {
        name: book.name,
        abbr: book.abbr,
        testament: book.testament,
        translation: translationName,
        chapters: {}
    };

    // Load existing file to resume progress WITHIN a book
    if (fs.existsSync(filePath)) {
        const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (Object.keys(existing.chapters).length >= book.chapters) {
            console.log(`   ⏭  SKIP  ${book.name} (Complete)`);
            return;
        }
        bookData = existing;
        console.log(`   🔄 RESUMING ${book.name} from Chapter ${Object.keys(bookData.chapters).length + 1}`);
    } else {
        console.log(`   📖 STARTING ${book.name} (${book.chapters} chapters)`);
    }

    for (let ch = 1; ch <= book.chapters; ch++) {
        // Skip chapters we already have
        if (bookData.chapters[String(ch)]) continue;

        const verses = await fetchChapter(book.name, ch, translationCode);
        
        if (verses) {
            bookData.chapters[String(ch)] = verses;
            process.stdout.write(`[Ch ${ch} ✓] `);
            // Save after EVERY chapter so we never lose progress
            fs.writeFileSync(filePath, JSON.stringify(bookData, null, 2), 'utf8');
        } else {
            process.stdout.write(`[Ch ${ch} ❌] `);
        }

        // --- THE "REST" PERIOD ---
        if (ch < book.chapters) {
            await sleep(4000); // 4 seconds between every single chapter
        }
    }
    console.log(`\n   ✅ Finished ${book.name}\n`);
}

function saveGlobalProgress(translation, bookIndex) {
    const checkpoint = { translation, bookIndex, timestamp: new Date().toISOString() };
    fs.writeFileSync(path.join(__dirname, 'progress.json'), JSON.stringify(checkpoint, null, 2));
}

function loadGlobalProgress() {
    try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'progress.json'), 'utf8')); } 
    catch { return null; }
}

async function main() {
    console.log('\n🕊  BIBLE DATA FETCHER (SNAIL MODE)');
    console.log('-------------------------------------------');
    
    const checkpoint = loadGlobalProgress();
    const translations = Object.entries(TRANSLATIONS);
    let startTIdx = 0, startBIdx = 0;

    if (checkpoint) {
        startTIdx = translations.findIndex(([n]) => n === checkpoint.translation);
        startBIdx = checkpoint.bookIndex;
        console.log(`📌 Resuming from: ${checkpoint.translation}, Book #${startBIdx + 1}\n`);
    }

    for (let tIdx = startTIdx; tIdx < translations.length; tIdx++) {
        const [tName, tCode] = translations[tIdx];
        const outDir = path.join(__dirname, 'data', tName);
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

        console.log(`\n== TRANSLATION: ${tName} ==`);

        const bookStart = (tIdx === startTIdx) ? startBIdx : 0;

        for (let i = bookStart; i < BOOKS.length; i++) {
            await fetchBook(BOOKS[i], tName, tCode, outDir);
            saveGlobalProgress(tName, i);
            
            if (i < BOOKS.length - 1) {
                console.log(`   ⏱  Resting 6s before next book...`);
                await sleep(6000);
            }
        }
    }

    if (fs.existsSync(path.join(__dirname, 'progress.json'))) {
        fs.unlinkSync(path.join(__dirname, 'progress.json'));
    }
    console.log('\n🏆 ALL DONE!');
}

main().catch(e => console.error("\nFATAL ERROR:", e));