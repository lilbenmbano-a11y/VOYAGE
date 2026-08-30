const fs = require('fs');
const { reply, getSender, getIsOwner } = require('./_helper');
const FILE = './data/anticall.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {enabled:false}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
async function anticallCommand(sock, chatId, message, args) {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const d = get(), sub = args[0]?.toLowerCase();
    if (!sub) return reply(sock, chatId, `📵 *Anti-Call*\nStatus: ${d.enabled?'✅ ON':'❌ OFF'}\n\n.anticall on\n.anticall off`, message);
    if (sub==='on')  { save({enabled:true});  return reply(sock, chatId, '✅ Anti-call enabled! Calls will be auto-rejected.', message); }
    if (sub==='off') { save({enabled:false}); return reply(sock, chatId, '❌ Anti-call disabled.', message); }
}
function isAnticallEnabled() { return get().enabled; }
module.exports = { anticallCommand, isAnticallEnabled };
