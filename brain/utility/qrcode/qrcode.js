// ============================================
// BRAIN/UTILITY/QR CODE — ENGINE
// Uses qrcode npm package
// npm install qrcode
// ============================================

import QRCode from 'qrcode';

/**
 * Generate a QR code as a PNG buffer
 * @param {string} text
 * @returns {Buffer}
 */
export async function generateQR(text) {
    const buffer = await QRCode.toBuffer(text, {
        type: 'png',
        width: 512,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
    });
    return { text, buffer };
}