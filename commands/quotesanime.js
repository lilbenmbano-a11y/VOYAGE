/**
 * Random Anime Quote
 * Usage: .animequote
 */
const fetch = require('node-fetch');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message) => {
    try {
        const res  = await fetch('https://katanime.vercel.app/api/getrandom?limit=1', { timeout: 10000 });
        const data = await res.json();
        const q    = data?.result?.[0];
        if (!q) throw new Error('No quote');

        const text =
            `✨ *Anime Quote*\n\n` +
            `"${q.en || q.indo}"\n\n` +
            `— *${q.character}*\n` +
            `📺 _(${q.anime})_\n\n` +
            `_VOYAGE XD©_`;

        await sock.sendMessage(chatId, { text }, { quoted: message });
    } catch {
        await reply(sock, chatId, '❌ Could not fetch anime quote. Try again.', message);
    }
};
