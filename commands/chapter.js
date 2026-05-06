// ============================================
// CHAPTER COMMAND
// .chapter Psalms 23
// .chapter John 3 GNT
// ============================================

import { chapterHandler } from '../brain/bible/index.js';
import ascii from '../brain/bible/ascii.js';

const chapter = {
    name: 'chapter',
    description: 'Get a full Bible chapter',
    usage: '.chapter <Book> <chapter> [KJV|GNT]',
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
                text: ascii.formatError('No arguments provided.', '*.chapter Psalms 23* or *.chapter John 3 GNT*')
            }, { quoted: message });
        }

        let argsCopy = [...args];
        let translation = 'KJV';
        if (['KJV', 'GNT'].includes(argsCopy[argsCopy.length - 1]?.toUpperCase())) {
            translation = argsCopy.pop().toUpperCase();
        }

        const chapterNum = Number(argsCopy.pop());
        const book       = argsCopy.join(' ');

        if (!book || isNaN(chapterNum)) {
            return sock.sendMessage(replyJid, {
                text: ascii.formatError('Invalid format.', '*.chapter Psalms 23* or *.chapter John 3 GNT*')
            }, { quoted: message });
        }

        const result = chapterHandler(book, chapterNum, translation);
        return sock.sendMessage(replyJid, {
            text: result
                ? ascii.formatChapter(result)
                : ascii.formatError(`*${book} Chapter ${chapterNum}* not found.`, 'Check book name and chapter number')
        }, { quoted: message });
    }
};

export default chapter;