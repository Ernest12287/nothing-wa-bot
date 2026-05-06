// ============================================
// BRAIN/BIBLE — ASCII
// Bible-specific message formatting with WINGS! 🦋
// ============================================

const THEMES = {
    verse:   { tl: '📜', tr: '✝️',  bl: '🙏', br: '💫', div: '─', wings: '🪽' },
    chapter: { tl: '📖', tr: '📚', bl: '🙏', br: '✝️',  div: '═', wings: '🪽' },
    search:  { tl: '🔍', tr: '📖', bl: '✨', br: '🙏', div: '─', wings: '🪽' },
    random:  { tl: '🎲', tr: '📖', bl: '✨', br: '🙏', div: '·', wings: '🦋' },
    error:   { tl: '❌', tr: '⚠️',  bl: '💡', br: '🔧', div: '─', wings: '🪽' },
};

function block({ theme = 'verse', title, tag, subtitle, body, footer }) {
    const t = THEMES[theme];
    const div = t.div.repeat(30);
    const wings = t.wings;
    const lines = [];
    
    // Top line with wings
    lines.push(`${wings} ${t.tl} *${title}*${tag ? ` [${tag}]` : ''} ${t.tr} ${wings}`);
    lines.push(div);
    
    if (subtitle) { 
        lines.push(`_${subtitle}_`); 
        lines.push(''); 
    }
    
    if (body) lines.push(body);
    lines.push('');
    
    // Bottom line with wings
    lines.push(`${t.bl} _${footer || ''}_ ${t.br} ${wings}`);
    
    return lines.join('\n');
}

export function formatVerse(v) {
    return block({
        theme: 'verse',
        title: v.reference,
        tag: v.translation,
        body: `❝ _${v.text}_ ❞`,
        footer: `${v.translation} Bible`
    });
}

export function formatRandom(v) {
    return block({
        theme: 'random',
        title: v.reference,
        tag: v.translation,
        subtitle: `Random verse from ${v.book}`,
        body: `❝ _${v.text}_ ❞`,
        footer: `${v.translation} Bible`
    });
}

export function formatChapter(c) {
    return block({
        theme: 'chapter',
        title: `${c.book} — Chapter ${c.chapter}`,
        tag: c.translation,
        body: c.verses.map(v => `*${v.verse}.* ${v.text}`).join('\n'),
        footer: `${c.translation} • ${c.verses.length} verses`
    });
}

export function formatSearch(results, keyword, translation) {
    if (!results.length) return block({
        theme: 'error',
        title: 'No Results',
        body: `No verses found for *"${keyword}"*\n\n💡 Try a different keyword`,
        footer: `Search: ${keyword}`
    });
    
    return block({
        theme: 'search',
        title: 'Search Results',
        tag: translation,
        subtitle: `"${keyword}" — ${results.length} result${results.length > 1 ? 's' : ''}`,
        body: results.map((r, i) => `*${i + 1}. ${r.reference}*\n_${r.text}_`).join('\n\n'),
        footer: `${translation} Bible Search`
    });
}

export function formatComparison(both) {
    return block({
        theme: 'verse',
        title: both.reference,
        subtitle: 'KJV vs GNT',
        body: `*📗 KJV*\n_${both.KJV}_\n\n*📘 GNT*\n_${both.GNT}_`,
        footer: 'Translation Comparison'
    });
}

export function formatError(msg, hint = null) {
    return block({
        theme: 'error',
        title: 'Error',
        body: `${msg}${hint ? `\n\n💡 *Tip:* ${hint}` : ''}`,
        footer: ''
    });
}

// Extra fancy version for special occasions (like Easter!)
export function formatVerseWithExtraWings(v) {
    return block({
        theme: 'verse',
        title: v.reference,
        tag: v.translation,
        body: `🕊️ ❸ _${v.text}_ 🪽`,
        footer: `${v.translation} Bible • Blessed`
    });
}

export default { 
    formatVerse, 
    formatRandom, 
    formatChapter, 
    formatSearch, 
    formatComparison, 
    formatError,
    formatVerseWithExtraWings 
};