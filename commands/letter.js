import { letterHandler } from '../brain/documents/docx/index.js';
import { formatLetter, formatError } from '../brain/documents/docx/ascii.js';

const letter = {
    name: 'letter',
    description: 'Generate a formal letter document',
    usage: '.letter <From> | <To> | <Subject> | <Body>',
    category: 'documents',
    ownerOnly: false, groupOnly: false, dmOnly: false, adminOnly: false,

    async execute(sock, message, args) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);
        const input    = args.join(' ');

        if (!input || !input.includes('|')) {
            const help =
`Usage: .letter <From> | <To> | <Subject> | <Body>

Example:
.letter Ernest | The Manager | Leave Request | I hereby request 3 days of annual leave from March 10th.`;
            await sock.sendMessage(replyJid, { text: formatError('Letter', help) }, { quoted: message });
            return;
        }

        await sock.sendMessage(replyJid, { text: '✉️ _Writing your letter..._' }, { quoted: message });

        try {
            const { buffer, to, subject, filename } = await letterHandler(input);
            await sock.sendMessage(replyJid, {
                document: buffer,
                mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                fileName: filename,
                caption: formatLetter(to, subject)
            }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(replyJid, { text: formatError('Letter', e.message) }, { quoted: message });
        }
    }
};

export default letter;