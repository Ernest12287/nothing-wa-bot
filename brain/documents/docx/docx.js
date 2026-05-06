// ============================================
// BRAIN/DOCUMENTS/DOCX — ENGINE
// npm install docx
// ============================================

import {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    AlignmentType, BorderStyle, Table, TableRow, TableCell,
    WidthType, Header, Footer, PageNumber, NumberFormat,
    UnderlineType, ShadingType
} from 'docx';

// ── Make Doc from text ──
export async function makeDoc(text) {
    const paragraphs = text.split('\n').map(line =>
        new Paragraph({
            children: [new TextRun({ text: line || ' ', size: 24, font: 'Calibri' })],
            spacing: { after: 120 }
        })
    );

    const doc = new Document({
        sections: [{
            properties: {},
            children: paragraphs
        }]
    });

    return Buffer.from(await Packer.toBuffer(doc));
}

// ── Resume ──
export async function makeResume(data) {
    // data: { name, title, email, phone, summary, skills[], experience[], education[] }

    const sectionHeader = (text) => new Paragraph({
        children: [new TextRun({ text, bold: true, size: 28, color: '2B579A', font: 'Calibri' })],
        spacing: { before: 240, after: 120 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2B579A' } }
    });

    const children = [
        // Name
        new Paragraph({
            children: [new TextRun({ text: data.name, bold: true, size: 52, font: 'Calibri', color: '1F1F1F' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 }
        }),
        // Title
        new Paragraph({
            children: [new TextRun({ text: data.title || '', size: 28, font: 'Calibri', color: '555555' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 }
        }),
        // Contact
        new Paragraph({
            children: [new TextRun({ text: `${data.email || ''}  •  ${data.phone || ''}`, size: 22, font: 'Calibri', color: '777777' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 }
        }),
    ];

    // Summary
    if (data.summary) {
        children.push(sectionHeader('SUMMARY'));
        children.push(new Paragraph({
            children: [new TextRun({ text: data.summary, size: 22, font: 'Calibri' })],
            spacing: { after: 120 }
        }));
    }

    // Skills
    if (data.skills?.length) {
        children.push(sectionHeader('SKILLS'));
        children.push(new Paragraph({
            children: [new TextRun({ text: data.skills.join('  •  '), size: 22, font: 'Calibri' })],
            spacing: { after: 120 }
        }));
    }

    // Experience
    if (data.experience?.length) {
        children.push(sectionHeader('EXPERIENCE'));
        for (const exp of data.experience) {
            children.push(new Paragraph({
                children: [
                    new TextRun({ text: exp.role, bold: true, size: 24, font: 'Calibri' }),
                    new TextRun({ text: `  —  ${exp.company}`, size: 24, font: 'Calibri', color: '555555' }),
                ],
                spacing: { after: 60 }
            }));
            if (exp.period) {
                children.push(new Paragraph({
                    children: [new TextRun({ text: exp.period, size: 20, font: 'Calibri', color: '888888', italics: true })],
                    spacing: { after: 60 }
                }));
            }
            if (exp.desc) {
                children.push(new Paragraph({
                    children: [new TextRun({ text: exp.desc, size: 22, font: 'Calibri' })],
                    spacing: { after: 160 }
                }));
            }
        }
    }

    // Education
    if (data.education?.length) {
        children.push(sectionHeader('EDUCATION'));
        for (const edu of data.education) {
            children.push(new Paragraph({
                children: [
                    new TextRun({ text: edu.degree, bold: true, size: 24, font: 'Calibri' }),
                    new TextRun({ text: `  —  ${edu.school}`, size: 24, font: 'Calibri', color: '555555' }),
                ],
                spacing: { after: 60 }
            }));
            if (edu.year) {
                children.push(new Paragraph({
                    children: [new TextRun({ text: edu.year, size: 20, font: 'Calibri', color: '888888', italics: true })],
                    spacing: { after: 160 }
                }));
            }
        }
    }

    const doc = new Document({ sections: [{ children }] });
    return Buffer.from(await Packer.toBuffer(doc));
}

// ── Formal Letter ──
export async function makeLetter(data) {
    // data: { from, to, subject, body, date }

    const date = data.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const doc = new Document({
        sections: [{
            children: [
                // From
                new Paragraph({ children: [new TextRun({ text: data.from || '', bold: true, size: 24, font: 'Calibri' })], spacing: { after: 60 } }),
                new Paragraph({ children: [new TextRun({ text: date, size: 22, font: 'Calibri', color: '666666' })], spacing: { after: 240 } }),

                // To
                new Paragraph({ children: [new TextRun({ text: 'To:', bold: true, size: 22, font: 'Calibri' })], spacing: { after: 60 } }),
                new Paragraph({ children: [new TextRun({ text: data.to || '', size: 22, font: 'Calibri' })], spacing: { after: 240 } }),

                // Subject
                new Paragraph({
                    children: [
                        new TextRun({ text: 'Subject: ', bold: true, size: 24, font: 'Calibri' }),
                        new TextRun({ text: data.subject || '', size: 24, font: 'Calibri', underline: { type: UnderlineType.SINGLE } })
                    ],
                    spacing: { after: 240 }
                }),

                // Salutation
                new Paragraph({ children: [new TextRun({ text: `Dear ${data.to || 'Sir/Madam'},`, size: 22, font: 'Calibri' })], spacing: { after: 120 } }),

                // Body
                ...data.body.split('\n').map(line => new Paragraph({
                    children: [new TextRun({ text: line || ' ', size: 22, font: 'Calibri' })],
                    spacing: { after: 120 }
                })),

                // Sign off
                new Paragraph({ children: [new TextRun({ text: 'Yours sincerely,', size: 22, font: 'Calibri' })], spacing: { before: 360, after: 480 } }),
                new Paragraph({ children: [new TextRun({ text: data.from || '', bold: true, size: 22, font: 'Calibri' })], spacing: { after: 60 } }),
            ]
        }]
    });

    return Buffer.from(await Packer.toBuffer(doc));
}

// ── Report ──
export async function makeReport(data) {
    // data: { title, author, sections: [{heading, content}] }

    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const children = [
        // Title
        new Paragraph({
            children: [new TextRun({ text: data.title, bold: true, size: 56, font: 'Calibri', color: '1F1F1F' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
        }),
        new Paragraph({
            children: [new TextRun({ text: `${data.author ? `By ${data.author}  •  ` : ''}${date}`, size: 22, font: 'Calibri', color: '888888', italics: true })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 480 }
        }),
    ];

    for (const section of (data.sections || [])) {
        // Section heading
        children.push(new Paragraph({
            children: [new TextRun({ text: section.heading, bold: true, size: 30, font: 'Calibri', color: '2B579A' })],
            spacing: { before: 360, after: 120 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } }
        }));
        // Content
        section.content.split('\n').forEach(line => {
            children.push(new Paragraph({
                children: [new TextRun({ text: line || ' ', size: 22, font: 'Calibri' })],
                spacing: { after: 120 }
            }));
        });
    }

    // Footer
    const doc = new Document({
        sections: [{
            properties: {},
            footers: {
                default: new Footer({
                    children: [new Paragraph({
                        children: [
                            new TextRun({ text: `${data.title}  •  Generated by Eren Bot  •  `, size: 18, color: 'AAAAAA' }),
                            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: 'AAAAAA' })
                        ],
                        alignment: AlignmentType.CENTER
                    })]
                })
            },
            children
        }]
    });

    return Buffer.from(await Packer.toBuffer(doc));
}