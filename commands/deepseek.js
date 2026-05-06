import { deepseekHandler } from '../brain/ai/index.js';
import { formatResponse, formatError } from '../brain/ai/ascii.js';

const deepseek = {
    name: 'deepseek',
    description: 'Ask DeepSeek AI a question',
    usage: '.deepseek <question>',
    category: 'ai',
    ownerOnly: false, groupOnly: false, dmOnly: false, adminOnly: false,

    async execute(sock, message, args) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);
        const prompt   = args.join(' ');

        if (!prompt) {
            await sock.sendMessage(replyJid, { text: formatError('DeepSeek', 'Provide a question.\nUsage: .deepseek <question>') }, { quoted: message });
            return;
        }

        await sock.sendMessage(replyJid, { text: '🤖 _Asking DeepSeek..._' }, { quoted: message });

        try {
            const { reply, model } = await deepseekHandler(prompt);
            await sock.sendMessage(replyJid, { text: formatResponse(model, prompt, reply) }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(replyJid, { text: formatError('DeepSeek', e.message) }, { quoted: message });
        }
    }
};

export default deepseek;