// ============================================
// BRAIN/AI — ASCII FORMATTING
// ============================================

export function formatResponse(model, prompt, reply) {
    const preview = prompt.length > 40 ? prompt.slice(0, 40) + '...' : prompt;
    return (
`🤖 *${model}* [AI] 🤖
──────────────────────────────
_Q: ${preview}_

${reply}

🤖 _Powered by ${model}_ 🤖`
    );
}

export function formatError(model, reason) {
    return (
`❌ *${model} Failed* [ERROR] ❌
──────────────────────────────

${reason}

❌ _Try again_ ❌`
    );
}