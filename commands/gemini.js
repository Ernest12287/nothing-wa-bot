import { geminiHandler } from '../brain/ai/index.js';
import { formatResponse, formatError } from '../brain/ai/ascii.js';

const gemini = {
    name: 'gemini',
    description: 'Ask Google Gemini a question',
    usage: '.gemini <question>',
    category: 'ai',
    ownerOnly: false, groupOnly: false, dmOnly: false, adminOnly: false,

    async execute(sock, message, args) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);
        const prompt   = args.join(' ');

        if (!prompt) {
            await sock.sendMessage(replyJid, { text: formatError('Gemini', 'Provide a question.\nUsage: .gemini <question>') }, { quoted: message });
            return;
        }

        await sock.sendMessage(replyJid, { text: '🤖 _Asking Gemini..._' }, { quoted: message });

        try {
            const { reply, model } = await geminiHandler(prompt);
            await sock.sendMessage(replyJid, { text: formatResponse(model, prompt, reply) }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(replyJid, { text: formatError('Gemini', e.message) }, { quoted: message });
        }
    }
};

export default gemini;