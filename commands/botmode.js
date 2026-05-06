// ============================================
// COMMAND: .botmode <on/off>
// Toggle public/private mode
// ============================================

import { ownerOnly } from './ownerGuard.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODE_FILE = path.resolve(__dirname, '../data/botmode.json');

export default {
    name: 'botmode',
    description: 'Toggle bot public/private mode',
    category: 'owner',

    async execute(sock, message, args) {
        await ownerOnly(sock, message, async (replyJid) => {
            const opt = args[0]?.toLowerCase();

            if (!opt || !['on', 'off'].includes(opt)) {
                await sock.sendMessage(replyJid, { text: `Usage: *.botmode <on | off>*` });
                return;
            }

            const publicMode = opt === 'on';
            const dir = path.dirname(MODE_FILE);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(MODE_FILE, JSON.stringify({ publicMode }, null, 2));

            await sock.sendMessage(replyJid, {
                text: publicMode
                    ? `✅ Bot is now *PUBLIC* — everyone can use it`
                    : `🔒 Bot is now *PRIVATE* — only you can use it`
            });
        });
    }
};