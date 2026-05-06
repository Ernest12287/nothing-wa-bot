// ============================================
// BRAIN/UTILITY/DICTIONARY — ASCII
// ============================================

export function formatDefinition(data) {
    const lines = [];

    lines.push(`📖 *${data.word}* ${data.phonetic ? `_(${data.phonetic})_` : ''}`);
    lines.push('──────────────────────────────');

    for (const r of data.results) {
        lines.push(`\n*${r.partOfSpeech}*`);
        lines.push(`${r.definition}`);
        if (r.example)   lines.push(`_"${r.example}"_`);
        if (r.synonyms.length) lines.push(`↔️ _Synonyms:_ ${r.synonyms.join(', ')}`);
        if (r.antonyms.length) lines.push(`↔️ _Antonyms:_ ${r.antonyms.join(', ')}`);
    }

    lines.push('\n📖 _via Free Dictionary API_ 📖');
    return lines.join('\n');
}

export function formatError(reason) {
    return (
`❌ *Define Failed* [ERROR] ❌
──────────────────────────────

${reason}

❌ _Try again_ ❌`
    );
}