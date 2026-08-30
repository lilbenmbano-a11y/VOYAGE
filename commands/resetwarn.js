const fs = require('fs');
const { reply, checkAdmin } = require('./_helper');
const FILE = './data/warnings.json';
module.exports = async (sock, chatId, message) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    try {
        const w = {}; fs.writeFileSync(FILE, JSON.stringify(w,null,2));
        await reply(sock, chatId, '✅ All warnings reset!', message);
    } catch { await reply(sock, chatId, '❌ Failed.', message); }
};
