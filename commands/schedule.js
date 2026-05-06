// ============================================
// COMMAND: .schedule
// Full calendar management per user
// Usage:
//   .schedule add
//   .schedule list
//   .schedule remove <id>
//   .schedule update <id> <field> <value>
// ============================================

import {
    getContact,
    addSchedule,
    removeSchedule,
    getAllContacts
} from '../brain/contacts/engine.js';
import { formatScheduleList, formatScheduleAdded } from '../brain/contacts/scheduleAscii.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── In-memory add flow state ──
// { jid: { step, data } }
const addFlow = new Map();

// ============================================
// GUIDED ADD FLOW
// Called from the message hook for users mid-flow
// ============================================

const ADD_STEPS = ['title', 'datetime', 'recurrence', 'reminder'];

const ADD_QUESTIONS = {
    title:      `📌 *What's the event title?*\n\n_e.g. Team Meeting, Doctor Appointment_`,
    datetime:   `🕐 *When is it? (EAT time)*\n\nFormat: *DD/MM/YYYY HH:MM*\n_e.g. 15/03/2026 09:00_`,
    recurrence: `🔁 *How often does it repeat?*\n\nReply: *once*, *daily*, *weekly*, or *monthly*`,
    reminder:   `⏰ *How many minutes before should I remind you?*\n\n_e.g. 15, 30, 60_`
};

const VALID_RECURRENCE = ['once', 'daily', 'weekly', 'monthly'];

// Convert EAT input to UTC ISO string
function eatToUTC(str) {
    // Expects DD/MM/YYYY HH:MM
    const [datePart, timePart] = str.trim().split(' ');
    if (!datePart || !timePart) return null;

    const [day, month, year] = datePart.split('/');
    const [hours, minutes]   = timePart.split(':');

    if (!day || !month || !year || !hours || !minutes) return null;

    // EAT = UTC+3, so subtract 3h to get UTC
    const eat = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
    );

    if (isNaN(eat.getTime())) return null;

    const utc = new Date(eat.getTime() - 3 * 60 * 60 * 1000);
    return utc.toISOString();
}

export function isInAddFlow(jid) {
    return addFlow.has(jid);
}

export async function handleAddFlow(sock, jid, replyJid, text) {
    const state = addFlow.get(jid);
    if (!state) return false;

    const input = text?.trim();

    // Cancel anytime
    if (input?.toLowerCase() === 'cancel') {
        addFlow.delete(jid);
        await sock.sendMessage(replyJid, { text: `❌ Schedule creation cancelled.` });
        return true;
    }

    const step = state.step;

    // ── Validate ──
    if (step === 'recurrence' && !VALID_RECURRENCE.includes(input?.toLowerCase())) {
        await sock.sendMessage(replyJid, {
            text: `⚠️ Reply with: *once*, *daily*, *weekly*, or *monthly*`
        });
        return true;
    }

    if (step === 'datetime') {
        const utc = eatToUTC(input);
        if (!utc) {
            await sock.sendMessage(replyJid, {
                text: `⚠️ Invalid format. Use *DD/MM/YYYY HH:MM*\n_e.g. 15/03/2026 09:00_`
            });
            return true;
        }
        state.data.datetime_utc = utc;
    } else if (step === 'reminder') {
        const mins = parseInt(input);
        if (isNaN(mins) || mins < 1) {
            await sock.sendMessage(replyJid, { text: `⚠️ Enter a valid number of minutes, e.g. *15*` });
            return true;
        }
        state.data.reminder_before_mins = mins;
    } else if (step === 'title') {
        state.data.title = input;
    } else if (step === 'recurrence') {
        state.data.recurrence = input.toLowerCase();
    }

    // ── Advance step ──
    const currentIndex = ADD_STEPS.indexOf(step);
    const nextStep     = ADD_STEPS[currentIndex + 1];

    if (!nextStep) {
        // Done — save schedule
        const id = addSchedule(jid, state.data);
        addFlow.delete(jid);

        const saved = { id, ...state.data };
        await sock.sendMessage(replyJid, { text: formatScheduleAdded(saved) });
        return true;
    }

    state.step = nextStep;
    addFlow.set(jid, state);
    await sock.sendMessage(replyJid, { text: ADD_QUESTIONS[nextStep] });
    return true;
}

// ============================================
// COMMAND
// ============================================

export default {
    name: 'schedule',
    description: 'Manage your personal schedules',
    category: 'contacts',

    async execute(sock, message, args) {
        const senderJid = message.key.participantAlt ||
                          message.key.remoteJidAlt   ||
                          message.key.participant    ||
                          message.key.remoteJid;

        const replyJid = message.key.remoteJid;
        const contact  = getContact(senderJid);
        const sub      = args[0]?.toLowerCase();

        // Must be registered
        if (!contact || contact.status !== 'registered') {
            await sock.sendMessage(replyJid, {
                text: `❌ You need a profile first.\n\nSend me any message and I'll set you up! 😊`
            });
            return;
        }

        const name = contact.profile?.name || 'Friend';

        // ══════════════════════════
        // ADD — start guided flow
        // ══════════════════════════
        if (!sub || sub === 'add') {
            addFlow.set(senderJid, { step: 'title', data: {} });
            await sock.sendMessage(replyJid, {
                text: `📅 *New Schedule*\n\n${ADD_QUESTIONS.title}\n\n_Type *cancel* anytime to stop_`
            });
            return;
        }

        // ══════════════════════════
        // LIST
        // ══════════════════════════
        if (sub === 'list') {
            await sock.sendMessage(replyJid, {
                text: formatScheduleList(contact.schedules, name)
            });
            return;
        }

        // ══════════════════════════
        // REMOVE
        // ══════════════════════════
        if (sub === 'remove') {
            const id = args[1];
            if (!id) {
                await sock.sendMessage(replyJid, {
                    text: `Usage: *.schedule remove <id>*\n\nGet IDs from *.schedule list*`
                });
                return;
            }

            const ok = removeSchedule(senderJid, id);
            await sock.sendMessage(replyJid, {
                text: ok ? `🗑️ Schedule removed.` : `❌ Schedule ID not found.`
            });
            return;
        }

        // ══════════════════════════
        // UPDATE
        // ══════════════════════════
        if (sub === 'update') {
            const id    = args[1];
            const field = args[2];
            const value = args.slice(3).join(' ');

            if (!id || !field || !value) {
                await sock.sendMessage(replyJid, {
                    text: `Usage: *.schedule update <id> <field> <value>*\nFields: title, recurrence, reminder_before_mins`
                });
                return;
            }

            // Load contacts and update inline
            const CONTACTS_FILE = path.resolve(__dirname, '../data/contacts.json');
            const all = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
            const userContact = all[senderJid];
            if (!userContact) {
                await sock.sendMessage(replyJid, { text: `❌ Contact not found.` });
                return;
            }

            const schedule = userContact.schedules?.find(s => s.id === id);
            if (!schedule) {
                await sock.sendMessage(replyJid, { text: `❌ Schedule ID not found.` });
                return;
            }

            if (field === 'datetime') {
                const utc = eatToUTC(value);
                if (!utc) {
                    await sock.sendMessage(replyJid, { text: `⚠️ Use format: DD/MM/YYYY HH:MM` });
                    return;
                }
                schedule.datetime_utc = utc;
            } else if (field === 'reminder_before_mins') {
                schedule.reminder_before_mins = parseInt(value);
            } else {
                schedule[field] = value;
            }

            fs.writeFileSync(CONTACTS_FILE, JSON.stringify(all, null, 2));
            await sock.sendMessage(replyJid, {
                text: `✅ Updated *${field}* for "${schedule.title}"`
            });
            return;
        }

        // ── Unknown ──
        await sock.sendMessage(replyJid, {
            text: `*📅 .schedule usage:*\n\n.schedule add\n.schedule list\n.schedule remove <id>\n.schedule update <id> <field> <value>`
        });
    }
};