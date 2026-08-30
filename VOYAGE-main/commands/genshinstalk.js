/**
 * Genshin Impact Character Lookup
 * Usage: .genshin <character name>
 */
const axios  = require('axios');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message, args) => {
    const query = args.join(' ').trim().toLowerCase().replace(/\s+/g, '-');
    if (!query) return reply(sock, chatId, '❌ Usage: .genshin <character name>', message);

    await reply(sock, chatId, `🎮 Looking up Genshin character: *${args.join(' ')}*...`, message);
    try {
        const { data } = await axios.get(`https://genshin.jmp.blue/characters/${query}`, { timeout: 10000 });
        if (!data?.name) throw new Error('not found');

        const text =
            `⚔️ *${data.name}*\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🌟 *Vision:* ${data.vision || '-'}\n` +
            `⚔️ *Weapon:* ${data.weapon || '-'}\n` +
            `🌍 *Nation:* ${data.nation || '-'}\n` +
            `✨ *Rarity:* ${'⭐'.repeat(data.rarity || 4)}\n` +
            `📝 *Description:*\n${data.description?.slice(0, 400) || 'N/A'}\n\n` +
            `_VOYAGE XD©_`;

        const imgUrl = `https://genshin.jmp.blue/characters/${query}/card`;
        try {
            await sock.sendMessage(chatId, { image: { url: imgUrl }, caption: text }, { quoted: message });
        } catch {
            await sock.sendMessage(chatId, { text }, { quoted: message });
        }
    } catch {
        await reply(sock, chatId, `❌ Character not found. Try a different name.`, message);
    }
};
