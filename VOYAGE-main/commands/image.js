const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const q = args.join(' ').trim();
    if (!q) return reply(sock, chatId, '❌ Usage: .image <search query>', message);
    await reply(sock, chatId, `🔍 Searching images for: *${q}*...`, message);
    try {
        const r = await axios.get(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=1&client_id=demo`, { timeout: 10000 });
        const img = r.data.results?.[0];
        if (!img) throw new Error('No results');
        const buf = await axios.get(img.urls.regular, { responseType: 'arraybuffer', timeout: 15000 });
        await sock.sendMessage(chatId, { image: Buffer.from(buf.data), caption: `🖼️ *${q}*\n📸 ${img.user.name}\n\n_TunzyMD©_` }, { quoted: message });
    } catch {
        try {
            const r2 = await axios.get(`https://source.unsplash.com/800x600/?${encodeURIComponent(q)}`, { responseType: 'arraybuffer', timeout: 15000 });
            await sock.sendMessage(chatId, { image: Buffer.from(r2.data), caption: `🖼️ *${q}*\n\n_TunzyMD©_` }, { quoted: message });
        } catch { await reply(sock, chatId, '❌ Image not found.', message); }
    }
};
