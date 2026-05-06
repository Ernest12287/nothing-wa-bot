// ============================================
// COMMAND: .broadcast <message>
// Owner mass-messages all registered contacts
// ============================================

import { ownerOnly } from './ownerGuard.js';
import { getRegisteredContacts } from '../brain/contacts/engine.js';

export default {
    name: 'broadcast',
    description: 'Send a message to all registered contacts',
    category: 'owner',

    async execute(sock, message, args) {
        await ownerOnly(sock, message, async (replyJid) => {
            const text = args.join(' ');
            if (!text) {
                await sock.sendMessage(replyJid, { text: `Usage: *.broadcast <message>*` });
                return;
            }

            const contacts = getRegisteredContacts();
            if (!contacts.length) {
                await sock.sendMessage(replyJid, { text: `📭 No registered contacts yet.` });
                return;
            }

            await sock.sendMessage(replyJid, {
                text: `📤 Sending to ${contacts.length} contacts...`
            });

            let sent = 0, failed = 0;

            for (const contact of contacts) {
                try {
                    await sock.sendMessage(contact.jid, { text });
                    sent++;
                    await new Promise(r => setTimeout(r, 1500));
                } catch (_) {
                    failed++;
                }
            }

            await sock.sendMessage(replyJid, {
                text: `✅ Broadcast done!\n\n📨 Sent: ${sent}\n❌ Failed: ${failed}`
            });
        });
    }
};