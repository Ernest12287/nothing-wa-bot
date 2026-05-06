// ============================================
// SEARCH COMMAND
// .search love one another
// .search faith GNT
// ============================================

import { searchHandler } from '../brain/bible/index.js';
import ascii from '../brain/bible/ascii.js';

const search = {
    name: 'search',
    description: 'Search the Bible for a keyword',
    usage: '.search <keyword> [KJV|GNT]',
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
                text: ascii.formatError('No keyword provided.', '*.search love one another* or *.search faith GNT*')
            }, { quoted: message });
        }

        let argsCopy = [...args];
        let translation = 'KJV';
        if (['KJV', 'GNT'].includes(argsCopy[argsCopy.length - 1]?.toUpperCase())) {
            translation = argsCopy.pop().toUpperCase();
        }

        const keyword = argsCopy.join(' ');
        const results = searchHandler(keyword, translation, 10);

        return sock.sendMessage(replyJid, {
            text: ascii.formatSearch(results, keyword, translation)
        }, { quoted: message });
    }
};

export default search;