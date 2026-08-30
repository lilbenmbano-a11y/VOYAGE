const axios = require('axios');
const fs = require('fs'), path = require('path');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    try {
        const text = args.join(' ').trim();
        if (!text) return reply(sock, chatId, '❌ Usage: .tts <text>', message);
        if (text.length > 200) return reply(sock, chatId, '❌ Max 200 characters.', message);
        const res = await axios.get(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`,{responseType:'arraybuffer',headers:{'User-Agent':'Mozilla/5.0'},timeout:15000});
        const tmp = path.join('./temp',`tts_${Date.now()}.mp3`);
        fs.writeFileSync(tmp, Buffer.from(res.data));
        await sock.sendMessage(chatId, { audio: fs.readFileSync(tmp), mimetype: 'audio/mpeg', ptt: true }, { quoted: message });
        try { fs.unlinkSync(tmp); } catch {}
    } catch { await reply(sock, chatId, '❌ TTS failed.', message); }
};
