const fs = require('fs');
const { checkAdmin, getMentioned, reply, SIG } = require('./_helper');
const FILE = './data/warnings.json';
function getW() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {}; } }
module.exports = async (sock, chatId, message) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ You need to be an admin.', message);
    const w = getW(), mentioned = getMentioned(message);
    if (!mentioned.length) {
        Object.keys(w).forEach(k => { if (k.startsWith(chatId+'_')) delete w[k]; });
        fs.writeFileSync(FILE, JSON.stringify(w,null,2));
        return reply(sock, chatId, '✅ All warnings cleared!', message);
    }
    for (const user of mentioned) {
        delete w[`${chatId}_${user}`];
        await sock.sendMessage(chatId, { text: `✅ Warnings cleared for @${user.split('@')[0]}${SIG}`, mentions: [user] }, { quoted: message });
    }
    fs.writeFileSync(FILE, JSON.stringify(w,null,2));
};
