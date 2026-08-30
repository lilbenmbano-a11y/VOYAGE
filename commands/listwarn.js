const fs = require('fs');
const { reply } = require('./_helper');
const FILE = './data/warnings.json';
function getW() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {}; } }
module.exports = async (sock, chatId, message) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    const w = getW();
    const all = Object.entries(w).filter(([k])=>k.startsWith(chatId+'_')).filter(([,v])=>v>0);
    if (!all.length) return reply(sock, chatId, '✅ No warnings in this group.', message);
    let text = `⚠️ *Warning List*\n━━━━━━━━━━━━\n`; const mentions = [];
    all.forEach(([k,v])=>{ const uid=k.replace(chatId+'_',''); text+=`@${uid.split('@')[0]}: ${v}/3\n`; mentions.push(uid); });
    await sock.sendMessage(chatId, { text: text+'\n\n_VOYAGE XD©_', mentions }, { quoted: message });
};
