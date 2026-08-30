const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const q = args.join(' ').trim() || 'nature';
    await reply(sock, chatId, `🖼️ Fetching wallpaper: *${q}*...`, message);
    try {
        const r = await axios.get(`https://source.unsplash.com/1920x1080/?${encodeURIComponent(q)}`, { responseType: 'arraybuffer', timeout: 20000, maxRedirects: 5 });
        await sock.sendMessage(chatId, { image: Buffer.from(r.data), caption: `🖼️ *Wallpaper: ${q}*\n\n_VOYAGE XD©_` }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Could not fetch wallpaper.', message); }
};
