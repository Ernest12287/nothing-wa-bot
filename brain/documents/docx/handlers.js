// ============================================
// BRAIN/DOCUMENTS/DOCX — HANDLERS
// ============================================

import { makeDoc, makeResume, makeLetter, makeReport } from './docx.js';

export async function makeDocHandler(text) {
    if (!text?.trim()) throw new Error('No text provided.');
    const buffer = await makeDoc(text.trim());
    return { buffer, filename: 'document.docx' };
}

export async function resumeHandler(input) {
    // input: "Name | title | email | phone | summary | skills: a,b,c | exp: role@company@period@desc | edu: degree@school@year"
    const parts = input.split('|').map(p => p.trim());
    const name  = parts[0];
    if (!name) throw new Error('Provide at least a name.');

    const get = (prefix) => parts.find(p => p.toLowerCase().startsWith(prefix))?.replace(new RegExp(`^${prefix}`, 'i'), '').trim() || '';

    const skills     = get('skills:').split(',').map(s => s.trim()).filter(Boolean);
    const expRaw     = parts.filter(p => p.toLowerCase().startsWith('exp:')).map(p => {
        const [role, company, period, desc] = p.replace(/^exp:/i, '').trim().split('@').map(x => x.trim());
        return { role, company, period, desc };
    });
    const eduRaw     = parts.filter(p => p.toLowerCase().startsWith('edu:')).map(p => {
        const [degree, school, year] = p.replace(/^edu:/i, '').trim().split('@').map(x => x.trim());
        return { degree, school, year };
    });

    const data = {
        name,
        title:      parts[1] || '',
        email:      parts[2] || '',
        phone:      parts[3] || '',
        summary:    get('summary:'),
        skills,
        experience: expRaw,
        education:  eduRaw
    };

    const buffer = await makeResume(data);
    return { buffer, name, filename: `resume_${name.replace(/\s+/g, '_')}.docx` };
}

export async function letterHandler(input) {
    // input: "From | To | Subject | body text"
    const parts   = input.split('|').map(p => p.trim());
    if (parts.length < 4) throw new Error('Provide: From | To | Subject | Body');
    const [from, to, subject, ...bodyParts] = parts;
    const body    = bodyParts.join('\n');
    const buffer  = await makeLetter({ from, to, subject, body });
    return { buffer, from, to, subject, filename: `letter_${to.replace(/\s+/g, '_')}.docx` };
}

export async function reportHandler(input) {
    // input: "Title | Author | Heading1:content1 | Heading2:content2"
    const parts   = input.split('|').map(p => p.trim());
    if (parts.length < 3) throw new Error('Provide: Title | Author | Heading:Content ...');
    const [title, author, ...sectionParts] = parts;
    const sections = sectionParts.map(p => {
        const idx     = p.indexOf(':');
        const heading = p.slice(0, idx).trim();
        const content = p.slice(idx + 1).trim();
        return { heading, content };
    });
    const buffer = await makeReport({ title, author, sections });
    return { buffer, title, author, filename: `report_${title.replace(/\s+/g, '_')}.docx` };
}