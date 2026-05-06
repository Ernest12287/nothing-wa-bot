// ============================================
// WELCOME MESSAGE
// Sent when bot successfully connects
// ============================================

import fs from 'fs';
import logger from '../logger.js';
import config from '../config.js';

export async function sendWelcomeMessage(sock, commands) {
    try {
        const botJid = sock.user.id;
        
        // Get user number (LID-aware)
        let userNumber;
        if (botJid.includes(':')) {
            userNumber = botJid.split(':')[0] + '@s.whatsapp.net';
        } else {
            userNumber = botJid;
        }
        
        logger.info(`[WELCOME] Sending to: ${userNumber}`);
        console.log('[IMAGE PATH]', config.bot.welcomeImage);
        
        const commandCount = commands.size;
        
        const welcomeText = `╔═══════════════════════╗\n` +
            `║   🎉 *CONNECTION SUCCESS* 🎉   ║\n` +
            `╚═══════════════════════╝\n\n` +
            `Hello *${config.user.name}*! 👋\n\n` +
            `Thank you for using *${config.bot.name}* (v7)! 🤖\n\n` +
            `📊 *Bot Statistics:*\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `• Total Commands: *${commandCount}* ✅\n` +
            `• Version: *${config.bot.version}* 📖\n` +
            `• Prefix: *${config.bot.defaultPrefix}* ⚡\n` +
            `• Baileys: *v7 (LID Support)* 🔥\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `✨ *NEW FEATURES:*\n` +
            `• 📅 Auto Scheduler (Bible Verses)\n` +
            `• 📞 Anticall Protection\n` +
            `• 🛡️ Antispam File Blocker\n` +
            `• 🏷️ Antitag System\n` +
            `• 📝 Antiword Filter\n` +
            `• 🔄 Auto-Update System\n` +
            `• 🔌 Hot-Reload Plugins\n\n` +
            `🙏 *THANK YOU FOR USING THIS BOT!*\n\n` +
            `Your session was successfully loaded.\n` +
            `All systems operational! ✨\n\n` +
            `📱 *Connect With Us:*\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `• Telegram: ${config.social.telegram}\n` +
            `• WhatsApp: ${config.social.whatsappChannel}\n\n` +
            `🛠️ *Need Help?*\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `Contact owner for support.\n\n` +
            `👤 *Owner:* ${config.creator.name}\n` +
            `📞 *Contact:* wa.me/${config.creator.number}\n` +
            `📧 *Email:* ${config.creator.email}\n\n` +
            `💡 Type *${config.bot.defaultPrefix}help* for commands!\n\n` +
            `_Powered by Baileys v7_ 🎁\n` +
            `_© ${new Date().getFullYear()} ${config.bot.name}_ 💚`;

        if (fs.existsSync(config.bot.welcomeImage)) {
            const imageBuffer = fs.readFileSync(config.bot.welcomeImage);
            
            await sock.sendMessage(userNumber, {
                image: imageBuffer,
                caption: welcomeText
            });
            
            logger.success(`✅ Welcome message sent to ${config.user.name}`);
        } else {
            await sock.sendMessage(userNumber, { text: welcomeText });
            logger.warn(`⚠️ Welcome image not found, sent text only`);
        }
        
    } catch (error) {
        logger.error(`❌ Failed to send welcome: ${error.message}`);
    }
}