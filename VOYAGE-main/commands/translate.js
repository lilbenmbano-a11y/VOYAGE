const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    try {
        if (args.length < 2) {
            const q = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const qtxt = q?.conversation || q?.extendedTextMessage?.text;
            if (qtxt && args.length >= 1) {
                const r = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${args[0]}&dt=t&q=${encodeURIComponent(qtxt)}`,{timeout:10000});
                let out=''; r.data[0].forEach(c=>{if(c[0])out+=c[0];});
                return reply(sock, chatId, `🌐 *Translation → ${args[0].toUpperCase()}*\n\n${out}`, message);
            }
            return reply(sock, chatId, '❌ Usage: .tr <lang> <text>\nOr reply to msg: .tr en\n\nCodes: en es fr de pt ar zh ja hi sw', message);
        }
        const lang = args[0]; const text = args.slice(1).join(' ');
        const r = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`,{timeout:10000});
        let out=''; r.data[0].forEach(c=>{if(c[0])out+=c[0];});
        await reply(sock, chatId, `🌐 *Translation → ${lang.toUpperCase()}*\n\n*Original:* ${text}\n\n*Translated:* ${out}`, message);
    } catch { await reply(sock, chatId, '❌ Translation failed.', message); }
};
