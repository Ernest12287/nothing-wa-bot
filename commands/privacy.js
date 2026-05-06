// ============================================
// COMMAND: .privacy <setting> <value>
// Settings: lastseen, pic, status
// Values: all, contacts, none
// ============================================

import { ownerOnly } from './ownerGuard.js';

const VALID_VALUES = ['all', 'contacts', 'none'];

export default {
    name: 'privacy',
    description: 'Update privacy settings',
    category: 'owner',

    async execute(sock, message, args) {
        await ownerOnly(sock, message, async (replyJid) => {
            const setting = args[0]?.toLowerCase();
            const value   = args[1]?.toLowerCase();

            if (!setting || !value || !VALID_VALUES.includes(value)) {
                await sock.sendMessage(replyJid, {
                    text: `*Usage:* .privacy <setting> <value>\n\n*Settings:* lastseen, pic, status\n*Values:* all, contacts, none\n\n_e.g. .privacy lastseen contacts_`
                });
                return;
            }

            try {
                switch (setting) {
                    case 'lastseen':
                        await sock.updateLastSeenPrivacy(value);
                        break;
                    case 'pic':
                        await sock.updateProfilePicturePrivacy(value);
                        break;
                    case 'status':
                        await sock.updateStatusPrivacy(value);
                        break;
                    default:
                        await sock.sendMessage(replyJid, { text: `❌ Unknown setting: *${setting}*` });
                        return;
                }

                await sock.sendMessage(replyJid, {
                    text: `✅ *${setting}* privacy set to *${value}*`
                });
            } catch (err) {
                await sock.sendMessage(replyJid, { text: `❌ Failed: ${err.message}` });
            }
        });
    }
};