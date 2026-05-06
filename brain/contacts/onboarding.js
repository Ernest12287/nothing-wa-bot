// ============================================
// ONBOARDING ENGINE
// Manages the question flow per JID
// Returns { reply, nextStep, done, optedOut }
// Never sends — caller sends
// ============================================

import {
    getContact,
    createPendingContact,
    updateOnboardingStep,
    saveOnboardingField,
    completeOnboarding,
    markOptedOut
} from './engine.js';

// ============================================
// QUESTIONS FLOW
// Order matters
// ============================================

const STEPS = ['name', 'gender', 'religion', 'age', 'email'];

const QUESTIONS = {
    name:     `👋 Hey! I'm *Eren*, your personal assistant bot.\n\nTo get started, what's your *name*?\n\n_Type *skip* to opt out of being saved_`,
    gender:   `Nice to meet you, {name}! 😊\n\nWhat's your *gender*?\nReply: *male* or *female*`,
    religion: `Got it! What's your *religion*?\nReply: *Islam*, *Christian*, or *other*`,
    age:      `What's your *age*?`,
    email:    `Last one — what's your *email address*?\n\n_Type *skip* to skip this field_`
};

const VALID = {
    gender:   ['male', 'female'],
    religion: ['islam', 'christian', 'other']
};

// ============================================
// PROCESS ONBOARDING MESSAGE
// ============================================

export function processOnboarding(jid, text) {
    const contact = getContact(jid);
    const step = contact?.onboarding_step;
    const input = text?.trim();

    if (!step) return null;

    // ── OPT OUT ──
    if (step === 'name' && input.toLowerCase() === 'skip') {
        markOptedOut(jid);
        return {
            reply: `No problem! I won't save your info. You can still use bot commands normally. 👍`,
            done: true,
            optedOut: true
        };
    }

    // ── VALIDATE STEP ──
    if (VALID[step]) {
        if (!VALID[step].includes(input.toLowerCase())) {
            return {
                reply: `⚠️ Please reply with one of: *${VALID[step].join('* or *')}*`,
                done: false,
                optedOut: false
            };
        }
    }

    // ── SAVE FIELD ──
    const value = step === 'gender' || step === 'religion'
        ? input.toLowerCase()
        : input;

    // Skip optional fields
    if (step === 'email' && input.toLowerCase() === 'skip') {
        saveOnboardingField(jid, 'email', null);
    } else {
        saveOnboardingField(jid, step, value);
    }

    // ── ADVANCE STEP ──
    const currentIndex = STEPS.indexOf(step);
    const nextStep = STEPS[currentIndex + 1];

    if (!nextStep) {
        // Done!
        const saved = completeOnboarding(jid);
        const name = saved.profile.name || 'Friend';
        return {
            reply: `✅ *You're all set, ${name}!*\n\nI've saved your profile. You'll now receive personalized morning messages and can use *.profile* to see your info anytime. 🎉`,
            done: true,
            optedOut: false
        };
    }

    // ── NEXT QUESTION ──
    updateOnboardingStep(jid, nextStep);
    const name = getContact(jid)?.profile?.name || '';
    const question = QUESTIONS[nextStep].replace('{name}', name);

    return {
        reply: question,
        done: false,
        optedOut: false
    };
}

// ============================================
// START ONBOARDING (first message from unknown JID)
// ============================================

export function startOnboarding(jid) {
    createPendingContact(jid);
    return QUESTIONS.name;
}