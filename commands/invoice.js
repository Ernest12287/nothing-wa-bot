import { invoiceHandler } from '../brain/documents/pdf/index.js';
import { formatInvoice, formatError } from '../brain/documents/pdf/ascii.js';

// Usage: .invoice Client Name | Item desc:amount | Item desc:amount
// Example: .invoice Ernest Tech House | Web Design:500 | Hosting:50

const invoice = {
    name: 'invoice',
    description: 'Generate an invoice PDF',
    usage: '.invoice <Client> | <Item:Amount> | <Item:Amount>',
    category: 'documents',
    ownerOnly: false, groupOnly: false, dmOnly: false, adminOnly: false,

    async execute(sock, message, args) {
        const chatJid  = message.key.remoteJid;
        const replyJid = chatJid.endsWith('@g.us') ? chatJid : (message.key.remoteJidAlt || chatJid);
        const input    = args.join(' ');

        if (!input || !input.includes('|')) {
            const help =
`Usage: .invoice <Client> | <Item:Amount> | <Item:Amount>

Example:
.invoice Ernest Tech House | Web Design:500 | Hosting:50`;
            await sock.sendMessage(replyJid, { text: formatError('Invoice', help) }, { quoted: message });
            return;
        }

        await sock.sendMessage(replyJid, { text: '🧾 _Generating invoice..._' }, { quoted: message });

        try {
            const parts  = input.split('|').map(p => p.trim());
            const client = parts[0];
            const items  = parts.slice(1).map(p => {
                const [desc, amount] = p.split(':').map(x => x.trim());
                return { desc, amount: parseFloat(amount) || 0 };
            });

            const data = await invoiceHandler({ client, items });
            await sock.sendMessage(replyJid, {
                document: data.buffer,
                mimetype: 'application/pdf',
                fileName: data.filename,
                caption: formatInvoice(data)
            }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(replyJid, { text: formatError('Invoice', e.message) }, { quoted: message });
        }
    }
};

export default invoice;