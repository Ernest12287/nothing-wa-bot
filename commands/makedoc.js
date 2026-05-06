import { makeDocHandler } from '../brain/documents/docx/index.js';
import { formatMakeDoc, formatError } from '../brain/documents/docx/ascii.js';

const makedoc = {
    name: 'makedoc',
    description: 'Convert text to a Word document (.docx)',
    usage: '.makedoc <text>',
    category: 'documents',
    ownerOnly: false, groupOnly: false, dmOnly: false, adminOnly: false,

    async execute(sock, message, args) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);
        const text     = args.join(' ');

        if (!text) {
            await sock.sendMessage(replyJid, { text: formatError('MakeDoc', 'Provide some text.\nUsage: .makedoc <your text>') }, { quoted: message });
            return;
        }

        await sock.sendMessage(replyJid, { text: '📝 _Creating your document..._' }, { quoted: message });

        try {
            const { buffer, filename } = await makeDocHandler(text);
            await sock.sendMessage(replyJid, {
                document: buffer,
                mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                fileName: filename,
                caption: formatMakeDoc(text)
            }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(replyJid, { text: formatError('MakeDoc', e.message) }, { quoted: message });
        }
    }
};

export default makedoc;