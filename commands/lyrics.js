const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    try {
        const q = args.join(' ').trim();
        if (!q) return reply(sock, chatId, '❌ Usage: .lyrics Artist - Song', message);
        let artist='', title='';
        if (q.includes(' - ')) { [artist,title]=q.split(' - ').map(s=>s.trim()); } else { title=q; artist=q.split(' ')[0]; }
        const r = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,{timeout:10000});
        if (!r.data?.lyrics) return reply(sock, chatId, `❌ Lyrics not found. Try: .lyrics Artist - Song`, message);
        await reply(sock, chatId, `🎵 *${title}*\n👤 *${artist}*\n${'─'.repeat(18)}\n\n${r.data.lyrics.trim().slice(0,3500)}`, message);
    } catch { await reply(sock, chatId, '❌ Lyrics not found.', message); }
};
