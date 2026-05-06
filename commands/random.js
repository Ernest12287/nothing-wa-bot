// ============================================
// RANDOM COMMAND
// .random
// .random Psalms
// .random Psalms GNT
// ============================================

import { randomVerse, randomVerseFromBook } from '../brain/bible/index.js';
import ascii from '../brain/bible/ascii.js';

const random = {
    name: 'random',
    description: 'Get a random Bible verse',
    usage: '.random [book] [KJV|GNT]',
    category: 'bible',
    ownerOnly: false,
    groupOnly: false,
    dmOnly: false,
    adminOnly: false,

    async execute(sock, message, args, commands) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);

        let argsCopy = [...args];
        let translation = 'KJV';
        if (['KJV', 'GNT'].includes(argsCopy[argsCopy.length - 1]?.toUpperCase())) {
            translation = argsCopy.pop().toUpperCase();
        }

        const book   = argsCopy.join(' ') || null;
        const result = book
            ? randomVerseFromBook(book, translation)
            : randomVerse(translation);

        return sock.sendMessage(replyJid, {
            text: result
                ? ascii.formatRandom(result)
                : ascii.formatError(`No verse found${book ? ` from *${book}*` : ''}.`, 'Check the book name')
        }, { quoted: message });
    }
};

export default random;