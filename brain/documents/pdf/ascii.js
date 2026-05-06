// ============================================
// BRAIN/DOCUMENTS/PDF — ASCII FORMATTING
// ============================================

export function formatMakePdf(text) {
    const preview = text.length > 40 ? text.slice(0, 40) + '...' : text;
    return (
`📄 *PDF Created* [DONE] 📄
──────────────────────────────
_Content preview_

${preview}

📎 _Your PDF is ready to save_ 📎`
    );
}

export function formatImgPdf() {
    return (
`🖼️ *Image → PDF* [DONE] 🖼️
──────────────────────────────
_Your image has been converted_

The image is embedded at full
quality inside the PDF page.

📎 _Ready to download_ 📎`
    );
}

export function formatMergePdf(count) {
    return (
`🔗 *PDFs Merged* [DONE] 🔗
──────────────────────────────
_Files combined_

*${count}* PDFs merged into one
document successfully.

📎 _Your merged PDF is ready_ 📎`
    );
}

export function formatPdfInfo(info) {
    return (
`📋 *PDF Info* [META] 📋
──────────────────────────────
📌 *Title:* ${info.title}
✍️ *Author:* ${info.author}
📝 *Subject:* ${info.subject}
🛠️ *Creator:* ${info.creator}
🖨️ *Producer:* ${info.producer}
📄 *Pages:* ${info.pages}
📅 *Created:* ${info.created}
🔄 *Modified:* ${info.modified}

📋 _End of metadata_ 📋`
    );
}

export function formatCertificate(name) {
    return (
`🏆 *Certificate Generated* [DONE] 🏆
──────────────────────────────
_Recipient_

*${name}*

Certificate of Achievement
issued with today's date.

🎖️ _Ready to print or share_ 🎖️`
    );
}

export function formatInvoice(data) {
    const itemLines = data.items.map(i =>
        `  • ${i.desc.padEnd(20)} $${i.amount.toFixed(2)}`
    ).join('\n');
    return (
`🧾 *Invoice Generated* [DONE] 🧾
──────────────────────────────
_Bill To:_ ${data.client}
_Invoice #:_ ${data.invoiceNo}
_Date:_ ${data.date}

*Items:*
${itemLines}
──────────────────────────
  *Total:* $${data.total.toFixed(2)}

📎 _Invoice PDF is ready_ 📎`
    );
}

export function formatQrPdf(text) {
    const preview = text.length > 40 ? text.slice(0, 40) + '...' : text;
    return (
`📱 *QR Code → PDF* [DONE] 📱
──────────────────────────────
_Encoded content_

${preview}

Scan the QR code in the PDF
to access the content.

📎 _Your QR PDF is ready_ 📎`
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