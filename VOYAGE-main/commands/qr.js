const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    try {
        const text = args.join(' ').trim();
        if (!text) return reply(sock, chatId, '❌ Usage: .qr <text or URL>', message);
        const res = await axios.get(`https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(text)}`,{responseType:'arraybuffer',timeout:15000});
        await sock.sendMessage(chatId, { image: Buffer.from(res.data), caption: `✅ *QR Code*\n📝 ${text.slice(0,80)}` }, { quoted: message });
    } catch { await reply(sock, chatId, '❌ QR generation failed.', message); }
};
