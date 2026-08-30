const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    try {
        let q, a;
        try { const r=await axios.get('https://api.quotable.io/random',{timeout:8000}); q=r.data.content; a=r.data.author; }
        catch { q='The only way to do great work is to love what you do.'; a='Steve Jobs'; }
        await reply(sock, chatId, `💬 *Quote*\n\n_"${q}"_\n\n— *${a}*`, message);
    } catch { await reply(sock, chatId, '❌ Failed.', message); }
};
