const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const q = args.join(' ').trim();
    if (!q) return reply(sock, chatId, '❌ Usage: .pin <search query>', message);
    await reply(sock, chatId, `📌 Searching Pinterest for: *${q}*...`, message);
    try {
        const r = await axios.get(`https://api.pinterest.com/v5/pins/?query=${encodeURIComponent(q)}&page_size=1`, { timeout: 10000 });
        if (!r.data?.items?.length) throw new Error();
        const pin = r.data.items[0];
        const imgUrl = pin.media?.images?.['600x']?.url || pin.media?.images?.original?.url;
        if (!imgUrl) throw new Error();
        const buf = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 15000 });
        await sock.sendMessage(chatId, { image: Buffer.from(buf.data), caption: `📌 *${pin.title||q}*\n\n_VOYAGE XD©_` }, { quoted: message });
    } catch { await reply(sock, chatId, `❌ No Pinterest results for *${q}*.`, message); }
};
