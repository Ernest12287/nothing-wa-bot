// ============================================
// BRAIN/DOCUMENTS/DOCX — ASCII FORMATTING
// ============================================

export function formatMakeDoc(text) {
    const preview = text.length > 40 ? text.slice(0, 40) + '...' : text;
    return (
`📝 *Document Created* [DONE] 📝
──────────────────────────────
_Content preview_

${preview}

📎 _Your .docx is ready to save_ 📎`
    );
}

export function formatResume(name) {
    return (
`📄 *Resume Generated* [DONE] 📄
──────────────────────────────
_Candidate_

*${name}*

Clean professional resume layout
ready to edit in Word.

📎 _Open in Microsoft Word or Google Docs_ 📎`
    );
}

export function formatLetter(to, subject) {
    return (
`✉️ *Formal Letter Created* [DONE] ✉️
──────────────────────────────
_To:_ ${to}
_Subject:_ ${subject}

Professional letter layout
with date and signature block.

📎 _Your letter is ready_ 📎`
    );
}

export function formatReport(title) {
    return (
`📊 *Report Generated* [DONE] 📊
──────────────────────────────
_Title_

*${title}*

Formatted report with headings,
sections and page footer.

📎 _Open in Microsoft Word or Google Docs_ 📎`
    );
}

export function formatError(cmd, reason) {
    return (
`❌ *${cmd} Failed* [ERROR] ❌
──────────────────────────────

${reason}

❌ _Try again_ ❌`
    );
}