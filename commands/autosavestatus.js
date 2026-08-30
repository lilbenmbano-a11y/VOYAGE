const fs = require('fs');
const { reply, getSender, getIsOwner } = require('./_helper');
const FILE = './data/autosavestatus.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {enabled:false}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const sub = args[0]?.toLowerCase();
    const d = get();
    if (!sub) return reply(sock, chatId, `💾 *Auto Save Status*\nStatus: ${d.enabled?'✅ ON':'❌ OFF'}\n\n.autosavestatus on\n.autosavestatus off`, message);
    if (sub==='on')  { save({enabled:true});  return reply(sock, chatId, '✅ Auto-save status enabled!\nAll status updates will be saved to your DM.', message); }
    if (sub==='off') { save({enabled:false}); return reply(sock, chatId, '❌ Auto-save status disabled.', message); }
};
