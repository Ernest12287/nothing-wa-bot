// ============================================
// COMMAND: .text <tag> <message>
// Mass message everyone with a tag
// e.g. .text brother whats up bro
// ============================================

import { ownerOnly } from './ownerGuard.js';
import { getTag } from '../brain/contacts/friendsEngine.js';
import { getContact } from '../brain/contacts/engine.js';

export default {
    name: 'text',
    description: 'Mass message a tag group (e.g. .text brother hey!)',
    category: 'owner',

    async execute(sock, message, args) {
        await ownerOnly(sock, message, async (replyJid) => {
            const tag  = args[0]?.toLowerCase();
            const text = args.slice(1).join(' ');

            if (!tag || !text) {
                await sock.sendMessage(replyJid, {
                    text: `Usage: *.text <tag> <message>*\n_e.g. .text brother whats up bro_`
                });
                return;
            }

            const jids = getTag(tag);
            if (!jids.length) {
                await sock.sendMessage(replyJid, {
                    text: `❌ No one tagged as *${tag}*.\n\nUse *.add ${tag}* in their chat first.`
                });
                return;
            }

            await sock.sendMessage(replyJid, {
                text: `📤 Texting ${jids.length} *${tag}*(s)...`
            });

            let sent = 0, failed = 0;

            for (const jid of jids) {
                try {
                    await sock.sendMessage(jid, { text });
                    sent++;
                    await new Promise(r => setTimeout(r, 1200));
                } catch (_) {
                    failed++;
                }
            }

            await sock.sendMessage(replyJid, {
                text: `✅ Done!\n\n📨 Sent: ${sent} | ❌ Failed: ${failed}`
            });
        });
    }
};