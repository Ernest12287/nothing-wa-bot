// ============================================
// BRAIN/UTILITY/CALCULATOR — ENGINE
// ============================================

/**
 * Safely evaluate a math expression
 * @param {string} expression
 * @returns {{ result, expression } | null}
 */
export function calculate(expression) {
    // clean input
    const cleaned = expression
        .replace(/[^0-9+\-*/%.()^ ]/g, '')
        .replace(/\^/g, '**')
        .trim();

    if (!cleaned) return null;

    const result = Function('"use strict"; return (' + cleaned + ')')();
    if (!isFinite(result)) throw new Error('Result is not a finite number');

    return {
        expression: expression.trim(),
        result: parseFloat(result.toFixed(10))
    };
}