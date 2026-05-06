// ============================================
// BRAIN/DOCUMENTS/PDF — ENGINE
// pdf-lib: npm install pdf-lib
// ============================================

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// ── Make PDF from text ──
export async function makePdf(text) {
    const pdfDoc = await PDFDocument.create();
    const font   = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page   = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();

    const fontSize  = 12;
    const margin    = 50;
    const maxWidth  = width - margin * 2;
    const lineHeight = fontSize * 1.5;

    // word wrap
    const words = text.split(' ');
    const lines = [];
    let current = '';
    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(test, fontSize) > maxWidth) {
            lines.push(current);
            current = word;
        } else {
            current = test;
        }
    }
    if (current) lines.push(current);

    let y = height - margin;
    for (const line of lines) {
        if (y < margin) {
            const newPage = pdfDoc.addPage([595, 842]);
            y = newPage.getSize().height - margin;
        }
        page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
        y -= lineHeight;
    }

    return Buffer.from(await pdfDoc.save());
}

// ── Image to PDF ──
export async function imgToPdf(imageBuffer, mimeType) {
    const pdfDoc = await PDFDocument.create();
    const page   = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    const image = mimeType === 'image/png'
        ? await pdfDoc.embedPng(imageBuffer)
        : await pdfDoc.embedJpg(imageBuffer);

    const scaled = image.scaleToFit(width - 40, height - 40);
    page.drawImage(image, {
        x: (width - scaled.width) / 2,
        y: (height - scaled.height) / 2,
        width: scaled.width,
        height: scaled.height
    });

    return Buffer.from(await pdfDoc.save());
}

// ── Merge PDFs ──
export async function mergePdfs(pdfBuffers) {
    const merged = await PDFDocument.create();
    for (const buf of pdfBuffers) {
        const doc   = await PDFDocument.load(buf);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        for (const page of pages) merged.addPage(page);
    }
    return Buffer.from(await merged.save());
}

// ── PDF Info ──
export async function getPdfInfo(pdfBuffer) {
    const doc = await PDFDocument.load(pdfBuffer, { updateMetadata: false });
    return {
        title:    doc.getTitle()    || 'N/A',
        author:   doc.getAuthor()   || 'N/A',
        subject:  doc.getSubject()  || 'N/A',
        creator:  doc.getCreator()  || 'N/A',
        producer: doc.getProducer() || 'N/A',
        pages:    doc.getPageCount(),
        created:  doc.getCreationDate()?.toLocaleDateString() || 'N/A',
        modified: doc.getModificationDate()?.toLocaleDateString() || 'N/A',
    };
}

// ── Certificate ──
export async function makeCertificate(name, title = 'Certificate of Achievement') {
    const pdfDoc = await PDFDocument.create();
    const page   = pdfDoc.addPage([841, 595]); // A4 landscape
    const { width, height } = page.getSize();

    const fontBold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // background border
    page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: rgb(0.7, 0.6, 0.1), borderWidth: 4 });
    page.drawRectangle({ x: 30, y: 30, width: width - 60, height: height - 60, borderColor: rgb(0.7, 0.6, 0.1), borderWidth: 1 });

    // title
    const titleSize = 36;
    const titleWidth = fontBold.widthOfTextAtSize(title, titleSize);
    page.drawText(title, { x: (width - titleWidth) / 2, y: height - 120, size: titleSize, font: fontBold, color: rgb(0.7, 0.6, 0.1) });

    // divider
    page.drawLine({ start: { x: 80, y: height - 140 }, end: { x: width - 80, y: height - 140 }, thickness: 1, color: rgb(0.7, 0.6, 0.1) });

    // presented to
    const subText = 'This certificate is proudly presented to';
    const subSize = 16;
    const subWidth = fontItalic.widthOfTextAtSize(subText, subSize);
    page.drawText(subText, { x: (width - subWidth) / 2, y: height - 200, size: subSize, font: fontItalic, color: rgb(0.3, 0.3, 0.3) });

    // name
    const nameSize = 48;
    const nameWidth = fontBold.widthOfTextAtSize(name, nameSize);
    page.drawText(name, { x: (width - nameWidth) / 2, y: height - 280, size: nameSize, font: fontBold, color: rgb(0.1, 0.1, 0.5) });

    // divider
    page.drawLine({ start: { x: 80, y: height - 310 }, end: { x: width - 80, y: height - 310 }, thickness: 1, color: rgb(0.7, 0.6, 0.1) });

    // date
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const dateText = `Issued on ${date}`;
    const dateWidth = fontNormal.widthOfTextAtSize(dateText, 14);
    page.drawText(dateText, { x: (width - dateWidth) / 2, y: height - 360, size: 14, font: fontNormal, color: rgb(0.4, 0.4, 0.4) });

    // footer
    const footer = 'Eren Bot • Powered by Ernest Tech House';
    const footerWidth = fontItalic.widthOfTextAtSize(footer, 11);
    page.drawText(footer, { x: (width - footerWidth) / 2, y: 50, size: 11, font: fontItalic, color: rgb(0.6, 0.6, 0.6) });

    return Buffer.from(await pdfDoc.save());
}

// ── QR to PDF ──
export async function qrToPdf(text) {
    const QRCode = (await import('qrcode')).default;
    const qrBuffer = await QRCode.toBuffer(text, { type: 'png', width: 400, margin: 2 });

    const pdfDoc = await PDFDocument.create();
    const page   = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    const font  = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const image = await pdfDoc.embedPng(qrBuffer);
    const size  = 300;

    page.drawImage(image, { x: (width - size) / 2, y: (height - size) / 2, width: size, height: size });

    const label = text.length > 60 ? text.slice(0, 57) + '...' : text;
    const labelWidth = font.widthOfTextAtSize(label, 11);
    page.drawText(label, { x: (width - labelWidth) / 2, y: (height - size) / 2 - 25, size: 11, font, color: rgb(0.3, 0.3, 0.3) });

    return Buffer.from(await pdfDoc.save());
}