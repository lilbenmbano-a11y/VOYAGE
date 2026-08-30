/**
 * Google Search Command
 * Usage: .google <query>
 * Package: google-it (already available via npm)
 */
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message, args) => {
    const query = args.join(' ').trim();
    if (!query) return reply(sock, chatId, '❌ Usage: .google <search query>', message);

    await reply(sock, chatId, `🔍 Searching Google for: *${query}*...`, message);

    try {
        const google  = require('google-it');
        const results = await google({ query, limit: 5, disableConsole: true });

        if (!results || results.length === 0)
            return reply(sock, chatId, '❌ No results found.', message);

        let text = `🔍 *Google Results for:* _${query}_\n`;
        text    += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        results.slice(0, 5).forEach((r, i) => {
            text += `*${i + 1}. ${r.title}*\n`;
            text += `📝 ${r.snippet}\n`;
            text += `🔗 ${r.link}\n`;
            text += `───────────────────\n\n`;
        });

        text += `_VOYAGE XD©_`;

        await sock.sendMessage(chatId, { text }, { quoted: message });

    } catch (e) {
        await reply(sock, chatId, `❌ Google search failed: ${e.message || 'Unknown error'}`, message);
    }
};
