// ============================================
// CONNECTION HANDLER
// ============================================

import makeWASocket, {
    DisconnectReason,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion
} from 'baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import logger from '../logger.js';
import { getAuthState, generateSessionString } from './authHandler.js';
import { handleCall } from './anticallHandler.js';
import { loadCommands } from '../utils/commandloader.js';
import { sendWelcomeMessage } from '../utils/welcomeMessage.js';
import { startScheduler } from '../utils/scheduler.js';
import { initContacts } from '../brain/contacts/index.js';
import { startMorningScheduler } from '../brain/contacts/morningScheduler.js';
import { startScheduleReminder } from '../brain/contacts/scheduleReminder.js';
import handleMessages from './messagehandlers.js';

export async function connectToWhatsApp() {
    try {
        const { state, saveCreds } = await getAuthState();

        logger.info('📡 Fetching latest Baileys version...');
        const { version, isLatest } = await fetchLatestBaileysVersion();
        logger.success(`✅ Using WhatsApp v${version.join('.')}, isLatest: ${isLatest}`);

        logger.info('🔌 Initializing WhatsApp connection...');

        const sock = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            syncFullHistory: false,
            markOnlineOnConnect: true,
            browser: ['Ubuntu', 'Chrome', '20.0.04'],
            getMessage: async () => ({ conversation: '' })
        });

        // Save creds on every update — keeps local session fresh forever
        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            await handleConnectionUpdate(sock, update);
        });

        sock.ev.on('messages.upsert', async (m) => {
            const message = m.messages[0];
            if (!message) return;
            await handleMessages(sock, message, sock.commands || new Map());
        });

        sock.ev.on('call', async (callData) => {
            for (const call of callData) await handleCall(sock, call);
        });

    } catch (error) {
        logger.error(`❌ Failed to connect: ${error.message}`);
        logger.warn('🔄 Retrying in 10 seconds...');
        setTimeout(() => connectToWhatsApp(), 10000);
    }
}

async function handleConnectionUpdate(sock, update) {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
        console.log('\n');
        logger.success('╔══════════════════════════════════════╗');
        logger.success('║   📱 SCAN THIS QR CODE IN WHATSAPP  ║');
        logger.success('║   WhatsApp → Linked Devices → Link  ║');
        logger.success('╚══════════════════════════════════════╝');
        console.log('\n');
        qrcode.generate(qr, { small: true });
        console.log('\n');
    }

    if (connection === 'connecting') {
        logger.info('🔄 Connecting to WhatsApp...');
    }

    if (connection === 'close') {
        const statusCode = (lastDisconnect?.error instanceof Boom)
            ? lastDisconnect.error.output.statusCode
            : 500;

        logger.error(`❌ Connection closed. Status: ${statusCode}`);

        if (statusCode === DisconnectReason.loggedOut) {
            logger.fatal('🚫 Logged out — delete SESSION_ID from .env and restart for fresh QR');
            process.exit(1);
        }

        logger.warn('🔄 Reconnecting in 10 seconds...');
        setTimeout(() => connectToWhatsApp(), 10000);
    }

    else if (connection === 'open') {
        logger.success('╔══════════════════════════════════════╗');
        logger.success('║     CONNECTION ESTABLISHED ✅        ║');
        logger.success('╚══════════════════════════════════════╝');

        // Load commands
        const commands = await loadCommands();
        sock.commands = commands;
        logger.success(`✅ Loaded ${commands.size} commands`);

        // Init contact system — registers onboarding hook
        initContacts();

        // Generate + save session string every time we connect
        // After first QR scan → copy session_string.txt → set as SESSION_ID in .env
        // From then on, local folder keeps it alive. SESSION_ID is the backup.
        // Wait 3s for key files to be fully written, then generate session string
        setTimeout(() => generateSessionString(), 3000);

        await sendWelcomeMessage(sock, commands);

        logger.info('📅 Starting scheduler...');
        startScheduler(sock);
        logger.success('✅ Scheduler running');

        startMorningScheduler(sock);
        logger.success('✅ Morning message scheduler running');

        startScheduleReminder(sock);
        logger.success('✅ Schedule reminder engine running');
    }
}