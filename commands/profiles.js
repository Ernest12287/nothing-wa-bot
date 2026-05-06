// ============================================
// COMMAND: .profiles
// Owner-only: manage all saved contacts
// Usage:
//   .profiles              → list all
//   .profiles view <num>   → full details of one
//   .profiles edit <num> <field> <value>
//   .profiles remove <num>
//   .profiles optout <num>
// ============================================

import {
    getAllContacts,
    getRegisteredContacts,
    editContactField,
    removeContact,
    ownerOptOut
} from '../brain/contacts/engine.js';
import config from '../config.js';

const RELIGION_EMOJI = { islam: '☪️', christian: '✝️', other: '🌍' };
const GENDER_EMOJI   = { male: '👨', female: '👩' };

export default {
    name: 'profiles',
    description: 'Owner: manage all saved contacts',
    category: 'contacts',

    async execute(sock, message, args) {
        const senderJid = message.key.participantAlt ||
                          message.key.remoteJidAlt   ||
                          message.key.participant    ||
                          message.key.remoteJid;

        const replyJid  = message.key.remoteJid;

        // ── Owner only ──
        const ownerNumber = config.user.number.replace(/[^0-9]/g, '');
        const senderNum   = senderJid.replace(/[^0-9]/g, '');
        if (senderNum !== ownerNumber) {
            await sock.sendMessage(replyJid, { text: `🚫 Owner only.` });
            return;
        }

        const sub = args[0]?.toLowerCase();

        // ══════════════════════════
        // LIST ALL
        // ══════════════════════════
        if (!sub || sub === 'list') {
            const all = getAllContacts();
            const entries = Object.values(all);

            if (!entries.length) {
                await sock.sendMessage(replyJid, { text: `📭 No contacts saved yet.` });
                return;
            }

            const lines = [`*📋 ALL CONTACTS (${entries.length})*\n`];

            entries.forEach((c, i) => {
                const num = c.jid.split('@')[0];
                const badge = c.status === 'registered' ? '✅'
                            : c.opted_out              ? '🚫'
                            :                            '⏳';
                const name = c.profile?.name || '—';
                lines.push(`${i + 1}. ${badge} *${name}* (+${num})`);
            });

            lines.push(`\n_Use .profiles view <#> for details_`);
            await sock.sendMessage(replyJid, { text: lines.join('\n') });
            return;
        }

        // ── Get indexed contact for remaining subcommands ──
        const all     = Object.values(getAllContacts());
        const index   = parseInt(args[1]) - 1;
        const contact = all[index];

        // ══════════════════════════
        // VIEW ONE
        // ══════════════════════════
        if (sub === 'view') {
            if (!contact) {
                await sock.sendMessage(replyJid, { text: `❌ Contact #${args[1]} not found.` });
                return;
            }

            const p   = contact.profile;
            const num = contact.jid.split('@')[0];
            const schedCount = contact.schedules?.length || 0;

            const lines = [
                `╔══════════════════════╗`,
                `║   CONTACT PROFILE    ║`,
                `╚══════════════════════╝`,
                ``,
                `📱 *Number:* +${num}`,
                `🔖 *Status:* ${contact.status}`,
                ``,
                `👤 *Name:* ${p.name || '—'}`,
                `${GENDER_EMOJI[p.gender] || '👤'} *Gender:* ${p.gender || '—'}`,
                `${RELIGION_EMOJI[p.religion] || '🙏'} *Religion:* ${p.religion || '—'}`,
                `🎂 *Age:* ${p.age || '—'}`,
                `📧 *Email:* ${p.email || '—'}`,
                ``,
                `📅 *Schedules:* ${schedCount}`,
                `🌅 *Morning msgs:* ${contact.morning_messages?.enabled ? 'On' : 'Off'}`,
                ``,
                `_First seen: ${new Date(contact.meta.first_seen).toLocaleDateString('en-KE', { timeZone: 'Africa/Nairobi' })}_`,
                `_Last active: ${new Date(contact.meta.last_active).toLocaleDateString('en-KE', { timeZone: 'Africa/Nairobi' })}_`
            ].join('\n');

            await sock.sendMessage(replyJid, { text: lines });
            return;
        }

        // ══════════════════════════
        // EDIT FIELD
        // ══════════════════════════
        if (sub === 'edit') {
            // .profiles edit 2 name Hassan
            const field = args[2];
            const value = args.slice(3).join(' ');

            if (!contact || !field || !value) {
                await sock.sendMessage(replyJid, {
                    text: `Usage: *.profiles edit <#> <field> <value>*\nFields: name, gender, religion, age, email`
                });
                return;
            }

            const ok = editContactField(contact.jid, field, value);
            await sock.sendMessage(replyJid, {
                text: ok
                    ? `✅ Updated *${field}* → "${value}" for ${contact.profile?.name || contact.jid}`
                    : `❌ Contact not found.`
            });
            return;
        }

        // ══════════════════════════
        // REMOVE
        // ══════════════════════════
        if (sub === 'remove') {
            if (!contact) {
                await sock.sendMessage(replyJid, { text: `❌ Contact #${args[1]} not found.` });
                return;
            }

            const name = contact.profile?.name || contact.jid;
            removeContact(contact.jid);
            await sock.sendMessage(replyJid, { text: `🗑️ Removed *${name}* from contacts.` });
            return;
        }

        // ══════════════════════════
        // OPT OUT
        // ══════════════════════════
        if (sub === 'optout') {
            if (!contact) {
                await sock.sendMessage(replyJid, { text: `❌ Contact #${args[1]} not found.` });
                return;
            }

            const name = contact.profile?.name || contact.jid;
            ownerOptOut(contact.jid);
            await sock.sendMessage(replyJid, { text: `🚫 Marked *${name}* as opted out.` });
            return;
        }

        // ── Unknown subcommand ──
        await sock.sendMessage(replyJid, {
            text: `*📋 .profiles usage:*\n\n.profiles — list all\n.profiles view <#>\n.profiles edit <#> <field> <value>\n.profiles remove <#>\n.profiles optout <#>`
        });
    }
};