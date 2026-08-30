const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    try {
        const r = await axios.get('https://meme-api.com/gimme', { timeout: 10000 });
        const buf = await axios.get(r.data.url, { responseType: 'arraybuffer', timeout: 15000 });
        await sock.sendMessage(chatId, { image: Buffer.from(buf.data), caption: `😂 *${r.data.title}*\n\n_TunzyMD©_` }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Could not fetch meme.', message); }
};
