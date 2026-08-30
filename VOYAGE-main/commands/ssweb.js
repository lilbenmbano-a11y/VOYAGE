const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const url = args[0]?.trim();
    if (!url || !url.startsWith('http')) return reply(sock, chatId, '❌ Usage: .ssweb <URL>', message);
    await reply(sock, chatId, `📸 Taking screenshot of ${url}...`, message);
    try {
        const r = await axios.get(`https://api.screenshotmachine.com?key=demo&url=${encodeURIComponent(url)}&dimension=1366x768`, { responseType: 'arraybuffer', timeout: 20000 });
        await sock.sendMessage(chatId, { image: Buffer.from(r.data), caption: `🌐 *${url}*\n\n_TunzyMD©_` }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ Screenshot failed. Try a different URL.', message); }
};
