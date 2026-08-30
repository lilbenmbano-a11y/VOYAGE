const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    try {
        const word = args.join(' ').trim();
        if (!word) return reply(sock, chatId, '❌ Usage: .urban <word>', message);
        const r = await axios.get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(word)}`,{timeout:10000});
        const def = r.data.list[0];
        if (!def) return reply(sock, chatId, `❌ No definition found for *${word}*.`, message);
        const d = def.definition.replace(/\[|\]/g,'').slice(0,400);
        const e = def.example?.replace(/\[|\]/g,'').slice(0,200)||'';
        await reply(sock, chatId, `📖 *Urban: ${word}*\n\n${d}${e?'\n\n💬 _'+e+'_':''}\n\n👍 ${def.thumbs_up} | 👎 ${def.thumbs_down}`, message);
    } catch { await reply(sock, chatId, '❌ Urban Dictionary failed.', message); }
};
