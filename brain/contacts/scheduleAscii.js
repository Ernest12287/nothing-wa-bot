// ============================================
// SCHEDULE ASCII
// Formats schedule data for WhatsApp display
// ============================================

const RECURRENCE_EMOJI = {
    once:    '1️⃣',
    daily:   '📆',
    weekly:  '📅',
    monthly: '🗓️'
};

// Convert UTC datetime to EAT display string
function toEAT(utcStr) {
    const date = new Date(utcStr);
    return date.toLocaleString('en-KE', {
        timeZone: 'Africa/Nairobi',
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

export function formatScheduleList(schedules, name) {
    if (!schedules?.length) {
        return `📭 *No schedules found, ${name}.*\n\nUse *.schedule add* to create one!`;
    }

    const upcoming = schedules
        .filter(s => !s.sent || s.recurrence !== 'once')
        .sort((a, b) => new Date(a.datetime_utc) - new Date(b.datetime_utc));

    if (!upcoming.length) {
        return `📭 *No upcoming schedules, ${name}.*\n\nAll past events done. Use *.schedule add* to create a new one!`;
    }

    const lines = [
        `╔══════════════════════╗`,
        `║   📅 YOUR SCHEDULES  ║`,
        `╚══════════════════════╝`,
        ``
    ];

    upcoming.forEach((s, i) => {
        const emoji = RECURRENCE_EMOJI[s.recurrence] || '📌';
        lines.push(`*${i + 1}. ${s.title}*`);
        lines.push(`   ${emoji} ${s.recurrence} | 🕐 ${toEAT(s.datetime_utc)}`);
        lines.push(`   ⏰ Reminder: ${s.reminder_before_mins}min before`);
        lines.push(`   🔑 ID: \`${s.id}\``);
        lines.push('');
    });

    lines.push(`_${upcoming.length} schedule(s) total_`);
    return lines.join('\n');
}

export function formatScheduleAdded(schedule) {
    return [
        `✅ *Schedule Created!*`,
        ``,
        `📌 *${schedule.title}*`,
        `🕐 ${toEAT(schedule.datetime_utc)} (EAT)`,
        `${RECURRENCE_EMOJI[schedule.recurrence] || '📌'} Repeats: ${schedule.recurrence}`,
        `⏰ Reminder: ${schedule.reminder_before_mins} min before`,
        `🔑 ID: \`${schedule.id}\``,
        ``,
        `_I'll remind you on time! 👌_`
    ].join('\n');
}

export function formatScheduleReminder(schedule) {
    return [
        `⏰ *REMINDER*`,
        ``,
        `📌 *${schedule.title}*`,
        `🕐 Starting in ${schedule.reminder_before_mins} minute(s)!`,
        ``,
        `_Don't forget! - Eren_`
    ].join('\n');
}