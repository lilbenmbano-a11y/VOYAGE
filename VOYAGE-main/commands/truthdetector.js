const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, '❌ Usage: .truthdetector <statement>', message);
    let hash = 0; for (const c of text) hash = ((hash << 5) - hash) + c.charCodeAt(0);
    const pct = Math.abs(hash) % 101;
    const bar = '█'.repeat(Math.round(pct/10)) + '░'.repeat(10-Math.round(pct/10));
    const verdict = pct > 70 ? '✅ LIKELY TRUE' : pct > 40 ? '🤔 UNCERTAIN' : '❌ LIKELY FALSE';
    await reply(sock, chatId, `🔍 *Truth Detector*\n━━━━━━━━━━━━\n📝 "${text}"\n\n${bar} *${pct}%*\n\n${verdict}\n\n_For entertainment only!_`, message);
};
