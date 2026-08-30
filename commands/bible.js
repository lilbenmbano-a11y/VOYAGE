const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    try {
        let verse;
        if (args.length) {
            const ref = args.join(' ').trim();
            const r = await axios.get(`https://bible-api.com/${encodeURIComponent(ref)}`, { timeout: 10000 });
            verse = r.data;
        } else {
            const r = await axios.get('https://bible-api.com/?random=verse', { timeout: 10000 });
            verse = r.data;
        }
        await reply(sock, chatId, `📖 *Bible*\n━━━━━━━━━━━━\n📝 *${verse.reference}*\n\n_"${verse.text.trim()}"_`, message);
    } catch { await reply(sock, chatId, '❌ Could not fetch Bible verse.\nUsage: .bible John 3:16 OR .bible (random)', message); }
};
