import { dictionaryHandler } from '../brain/utility/dictionary/index.js';
import { formatDefinition, formatError } from '../brain/utility/dictionary/ascii.js';

const define = {
    name: 'define',
    description: 'Get the definition of a word',
    usage: '.define <word>',
    category: 'utility',
    ownerOnly: false, groupOnly: false, dmOnly: false, adminOnly: false,

    async execute(sock, message, args) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);
        const word     = args[0];

        if (!word) {
            await sock.sendMessage(replyJid, { text: formatError('Provide a word.\nUsage: .define <word>') }, { quoted: message });
            return;
        }

        try {
            const data = await dictionaryHandler(word);
            await sock.sendMessage(replyJid, { text: formatDefinition(data) }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(replyJid, { text: formatError(e.message) }, { quoted: message });
        }
    }
};

export default define;