import { groqHandler } from '../brain/ai/index.js';
import { formatResponse, formatError } from '../brain/ai/ascii.js';

const grok = {
    name: 'grok',
    description: 'Ask Grok AI a question',
    usage: '.grok <question>',
    category: 'ai',
    ownerOnly: false, groupOnly: false, dmOnly: false, adminOnly: false,

    async execute(sock, message, args) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);
        const prompt   = args.join(' ');

        if (!prompt) {
            await sock.sendMessage(replyJid, { text: formatError('Grok', 'Provide a question.\nUsage: .grok <question>') }, { quoted: message });
            return;
        }

        await sock.sendMessage(replyJid, { text: '🤖 _Asking Grok..._' }, { quoted: message });

        try {
            const { reply, model } = await groqHandler(prompt);
            await sock.sendMessage(replyJid, { text: formatResponse(model, prompt, reply) }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(replyJid, { text: formatError('Grok', e.message) }, { quoted: message });
        }
    }
};

export default grok;