const axios = require('axios');
const { reply } = require('./_helper');
const LANGS = { af:'Afrikaans',sq:'Albanian',ar:'Arabic',zh:'Chinese',nl:'Dutch',en:'English',fr:'French',de:'German',hi:'Hindi',it:'Italian',ja:'Japanese',ko:'Korean',pt:'Portuguese',ru:'Russian',es:'Spanish',sw:'Swahili',tr:'Turkish',zu:'Zulu',sn:'Shona',nd:'Ndebele' };
module.exports = async (sock, chatId, message, args) => {
    if (args.length < 2) return reply(sock, chatId, `❌ Usage: .translate2 <lang> <text>\n\nCodes: en es fr de pt ar zh ja hi sw sn zu`, message);
    const lang = args[0].toLowerCase(); const text = args.slice(1).join(' ');
    try {
        const r = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`, { timeout: 10000 });
        let out = ''; r.data[0].forEach(c => { if (c[0]) out += c[0]; });
        const detected = r.data[2] || 'auto';
        await reply(sock, chatId, `🌐 *Translation*\n━━━━━━━━━━━━\n🔤 *From:* ${LANGS[detected]||detected.toUpperCase()}\n🎯 *To:* ${LANGS[lang]||lang.toUpperCase()}\n\n📝 *Original:* ${text}\n\n✅ *Translated:* ${out}`, message);
    } catch { await reply(sock, chatId, '❌ Translation failed.', message); }
};
