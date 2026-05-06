// ============================================
// SCHEDULE REMINDER ENGINE
// Ticks every minute, sends reminders
// Uses reminder_before_mins to fire early
// ============================================

import { getAllContacts, markScheduleSent } from './engine.js';
import { formatScheduleReminder } from './scheduleAscii.js';
import logger from '../../logger.js';

// ============================================
// CHECK DUE REMINDERS
// ============================================

async function checkReminders(sock) {
    const contacts = getAllContacts();
    const now = new Date();

    for (const contact of Object.values(contacts)) {
        if (contact.status !== 'registered') continue;

        for (const s of contact.schedules || []) {
            if (s.sent && s.recurrence === 'once') continue;

            const schedTime  = new Date(s.datetime_utc);
            const reminderAt = new Date(schedTime.getTime() - s.reminder_before_mins * 60 * 1000);

            // Fire if we're within this minute's window
            const diff = Math.abs(now - reminderAt);
            if (diff <= 30 * 1000) { // within 30s of reminder time
                try {
                    await sock.sendMessage(contact.jid, {
                        text: formatScheduleReminder(s)
                    });

                    markScheduleSent(contact.jid, s.id);
                    logger.success(`[SCHEDULE] ✅ Reminder sent to ${contact.profile?.name || contact.jid}: "${s.title}"`);
                } catch (err) {
                    logger.error(`[SCHEDULE] ❌ Failed for ${contact.jid}: ${err.message}`);
                }
            }
        }
    }
}

// ============================================
// START REMINDER SCHEDULER
// ============================================

export function startScheduleReminder(sock) {
    logger.success('[SCHEDULE] ✅ Schedule reminder engine started');
    setInterval(() => checkReminders(sock), 60 * 1000);
}