const fs = require('fs');
const { reply, getSender, getIsOwner } = require('./_helper');
const FILE = './data/autoreact.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {enabled:false,emoji:'❤️'}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const d = get(), sub = args[0]?.toLowerCase();
    if (!sub) return reply(sock, chatId, `${d.emoji} *Auto-React*\nStatus: ${d.enabled?'✅ ON':'❌ OFF'}\nEmoji: ${d.emoji}\n\n.autoreact on\n.autoreact off\n.autoreact emoji <emoji>`, message);
    if (sub==='on')  { save({...d,enabled:true});  return reply(sock, chatId, `✅ Auto-react enabled! Will react with ${d.emoji}`, message); }
    if (sub==='off') { save({...d,enabled:false}); return reply(sock, chatId, '❌ Auto-react disabled.', message); }
    if (sub==='emoji'&&args[1]) { save({...d,emoji:args[1]}); return reply(sock, chatId, `✅ Auto-react emoji set to: ${args[1]}`, message); }
};
