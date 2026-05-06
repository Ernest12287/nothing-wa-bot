// ============================================
// VERSE COMMAND
// .verse John 3 16
// .verse John 3 16 GNT
// .verse John 3 16 both
// ============================================

import { verseHandler, verseBoth, resolveBook } from '../brain/bible/index.js';
import ascii from '../brain/bible/ascii.js';

const verse = {
    name: 'verse',
    description: 'Get a Bible verse by reference',
    usage: '.verse <Book> <chapter> <verse> [KJV|GNT|both]',
    category: 'bible',
    ownerOnly: false,
    groupOnly: false,
    dmOnly: false,
    adminOnly: false,

    async execute(sock, message, args, commands) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);

        if (!args.length) {
            return sock.sendMessage(replyJid, {
                text: ascii.formatError('No arguments provided.', '*.verse John 3 16* or *.verse John 3 16 GNT*')
            }, { quoted: message });
        }

        let argsCopy = [...args];
        let translation = 'KJV';
        if (['KJV', 'GNT'].includes(argsCopy[argsCopy.length - 1]?.toUpperCase())) {
            translation = argsCopy.pop().toUpperCase();
        }

        // .verse John 3 16 both
        if (argsCopy[argsCopy.length - 1]?.toLowerCase() === 'both') {
            argsCopy.pop();
            const verseNum   = Number(argsCopy.pop());
            const chapterNum = Number(argsCopy.pop());
            const book       = argsCopy.join(' ');
            const result     = verseBoth(book, chapterNum, verseNum);
            return sock.sendMessage(replyJid, {
                text: result
                    ? ascii.formatComparison(result)
                    : ascii.formatError(`*${book} ${chapterNum}:${verseNum}* not found.`)
            }, { quoted: message });
        }

        const verseNum   = Number(argsCopy.pop());
        const chapterNum = Number(argsCopy.pop());
        const book       = argsCopy.join(' ');

        if (!book || isNaN(chapterNum) || isNaN(verseNum)) {
            return sock.sendMessage(replyJid, {
                text: ascii.formatError('Invalid format.', '*.verse John 3 16* or *.verse John 3 16 GNT*')
            }, { quoted: message });
        }

        const result = verseHandler(book, chapterNum, verseNum, translation);
        return sock.sendMessage(replyJid, {
            text: result
                ? ascii.formatVerse(result)
                : ascii.formatError(`*${resolveBook(book) || book} ${chapterNum}:${verseNum}* not found.`, 'Check book name and numbers')
        }, { quoted: message });
    }
};

export default verse;