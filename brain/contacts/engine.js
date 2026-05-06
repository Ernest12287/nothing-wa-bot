// ============================================
// CONTACTS ENGINE
// Handles all contacts.json read/write ops
// No sock, no sending — pure data only
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTACTS_FILE = path.resolve(__dirname, '../../data/contacts.json');

// ============================================
// FILE HELPERS
// ============================================

function loadContacts() {
    try {
        if (fs.existsSync(CONTACTS_FILE)) {
            return JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
        }
    } catch (_) {}
    return {};
}

function saveContacts(data) {
    const dir = path.dirname(CONTACTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(data, null, 2));
}

// ============================================
// GETTERS
// ============================================

export function getContact(jid) {
    return loadContacts()[jid] || null;
}

export function getAllContacts() {
    return loadContacts();
}

export function getRegisteredContacts() {
    const all = loadContacts();
    return Object.values(all).filter(c => c.status === 'registered');
}

export function isKnown(jid) {
    const c = getContact(jid);
    return c !== null;
}

export function isOptedOut(jid) {
    const c = getContact(jid);
    return c?.opted_out === true;
}

export function isPending(jid) {
    const c = getContact(jid);
    return c?.status === 'pending';
}

export function isRegistered(jid) {
    const c = getContact(jid);
    return c?.status === 'registered';
}

// ============================================
// ONBOARDING STATE
// ============================================

export function createPendingContact(jid) {
    const contacts = loadContacts();
    contacts[jid] = {
        jid,
        status: 'pending',
        opted_out: false,
        onboarding_step: 'name',
        profile: {},
        schedules: [],
        morning_messages: { enabled: true, last_sent: null },
        meta: {
            first_seen: new Date().toISOString(),
            last_active: new Date().toISOString()
        }
    };
    saveContacts(contacts);
    return contacts[jid];
}

export function updateOnboardingStep(jid, step) {
    const contacts = loadContacts();
    if (!contacts[jid]) return;
    contacts[jid].onboarding_step = step;
    contacts[jid].meta.last_active = new Date().toISOString();
    saveContacts(contacts);
}

export function saveOnboardingField(jid, field, value) {
    const contacts = loadContacts();
    if (!contacts[jid]) return;
    contacts[jid].profile[field] = value;
    contacts[jid].meta.last_active = new Date().toISOString();
    saveContacts(contacts);
}

export function completeOnboarding(jid) {
    const contacts = loadContacts();
    if (!contacts[jid]) return;
    contacts[jid].status = 'registered';
    contacts[jid].onboarding_step = null;
    contacts[jid].meta.last_active = new Date().toISOString();
    saveContacts(contacts);
    return contacts[jid];
}

export function markOptedOut(jid) {
    const contacts = loadContacts();
    contacts[jid] = {
        jid,
        status: 'opted_out',
        opted_out: true,
        onboarding_step: null,
        profile: {},
        schedules: [],
        morning_messages: { enabled: false, last_sent: null },
        meta: {
            first_seen: contacts[jid]?.meta?.first_seen || new Date().toISOString(),
            last_active: new Date().toISOString()
        }
    };
    saveContacts(contacts);
}

// ============================================
// OWNER OPS
// ============================================

export function editContactField(jid, field, value) {
    const contacts = loadContacts();
    if (!contacts[jid]) return false;
    contacts[jid].profile[field] = value;
    saveContacts(contacts);
    return true;
}

export function removeContact(jid) {
    const contacts = loadContacts();
    if (!contacts[jid]) return false;
    delete contacts[jid];
    saveContacts(contacts);
    return true;
}

export function ownerOptOut(jid) {
    markOptedOut(jid);
    return true;
}

// ============================================
// SCHEDULES
// ============================================

export function addSchedule(jid, schedule) {
    const contacts = loadContacts();
    if (!contacts[jid]) return false;
    const id = `sch_${Date.now()}`;
    contacts[jid].schedules.push({ id, ...schedule, sent: false });
    saveContacts(contacts);
    return id;
}

export function removeSchedule(jid, scheduleId) {
    const contacts = loadContacts();
    if (!contacts[jid]) return false;
    contacts[jid].schedules = contacts[jid].schedules.filter(s => s.id !== scheduleId);
    saveContacts(contacts);
    return true;
}

export function markScheduleSent(jid, scheduleId) {
    const contacts = loadContacts();
    if (!contacts[jid]) return;
    const s = contacts[jid].schedules.find(s => s.id === scheduleId);
    if (s) {
        s.sent = true;
        s.last_sent = new Date().toISOString();
        // If recurring, reset sent flag for next occurrence
        if (s.recurrence !== 'once') s.sent = false;
    }
    saveContacts(contacts);
}

export function getDueSchedules() {
    const contacts = loadContacts();
    const now = new Date();
    const due = [];

    for (const contact of Object.values(contacts)) {
        if (contact.status !== 'registered') continue;
        for (const s of contact.schedules || []) {
            if (s.sent) continue;
            const schedTime = new Date(s.datetime_utc);
            if (schedTime <= now) {
                due.push({ jid: contact.jid, schedule: s });
            }
        }
    }

    return due;
}

// ============================================
// MORNING MESSAGE TRACKING
// ============================================

export function updateLastSent(jid, dateStr) {
    const contacts = loadContacts();
    if (!contacts[jid]) return;
    contacts[jid].morning_messages.last_sent = dateStr;
    saveContacts(contacts);
}