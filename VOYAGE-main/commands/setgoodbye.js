const fs = require('fs');
const { reply, getSender, getIsOwner } = require('./_helper');
const FILE = './data/goodbye.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    const msg = args.join(' ').trim();
    if (!msg) return reply(sock, chatId, '❌ Usage: .setgoodbye <message>', message);
    const d = get(); d[chatId] = {...d[chatId], msg, enabled: true}; save(d);
    await reply(sock, chatId, `✅ Goodbye message set!\n_${msg}_`, message);
};
