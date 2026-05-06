// ============================================
// BRAIN/UTILITY/DICTIONARY — ENGINE
// Free API: https://api.dictionaryapi.dev
// No key needed
// ============================================

export async function defineWord(word) {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (res.status === 404) throw new Error(`No definition found for "${word}"`);
    if (!res.ok) throw new Error(`Dictionary API error: ${res.status}`);

    const data = await res.json();
    const entry = data[0];

    const results = [];

    for (const meaning of entry.meanings.slice(0, 3)) {
        const def     = meaning.definitions[0];
        const synonyms = meaning.synonyms?.slice(0, 4) || def.synonyms?.slice(0, 4) || [];
        const antonyms = meaning.antonyms?.slice(0, 3) || def.antonyms?.slice(0, 3) || [];

        results.push({
            partOfSpeech: meaning.partOfSpeech,
            definition:   def.definition,
            example:      def.example || null,
            synonyms,
            antonyms
        });
    }

    return {
        word:       entry.word,
        phonetic:   entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '',
        results
    };
}