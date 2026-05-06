import { makePdfHandler } from '../brain/documents/pdf/index.js';
import { formatMakePdf, formatError } from '../brain/documents/pdf/ascii.js';

const makepdf = {
    name: 'makepdf',
    description: 'Convert text to a PDF document',
    usage: '.makepdf <text>',
    category: 'documents',
    ownerOnly: false, groupOnly: false, dmOnly: false, adminOnly: false,

    async execute(sock, message, args) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);
        const text     = args.join(' ');

        if (!text) {
            await sock.sendMessage(replyJid, { text: formatError('MakePDF', 'Provide some text.\nUsage: .makepdf <your text>') }, { quoted: message });
            return;
        }

        await sock.sendMessage(replyJid, { text: '📄 _Creating your PDF..._' }, { quoted: message });

        try {
            const { buffer, filename } = await makePdfHandler(text);
            await sock.sendMessage(replyJid, {
                document: buffer,
                mimetype: 'application/pdf',
                fileName: filename,
                caption: formatMakePdf(text)
            }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(replyJid, { text: formatError('MakePDF', e.message) }, { quoted: message });
        }
    }
};

export default makepdf;