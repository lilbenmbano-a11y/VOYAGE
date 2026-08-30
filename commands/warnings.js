const fs = require('fs');
const { getMentioned, reply, SIG } = require('./_helper');
const FILE = './data/warnings.json';
function getW() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {}; } }
module.exports = async (sock, chatId, message) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    const w=getW(), mentioned=getMentioned(message);
    if (mentioned.length) {
        for (const user of mentioned) {
            const count = w[`${chatId}_${user}`]||0;
            const bar = '🟥'.repeat(count)+'⬜'.repeat(3-count);
            await sock.sendMessage(chatId, { text: `⚠️ *Warnings*\n\n@${user.split('@')[0]}\n${bar} *${count}/3*${SIG}`, mentions: [user] }, { quoted: message });
        }
    } else {
        const all=Object.entries(w).filter(([k])=>k.startsWith(chatId+'_')).filter(([,v])=>v>0);
        if (!all.length) return reply(sock, chatId, '✅ No warnings in this group.', message);
        let text=`⚠️ *Group Warnings*\n━━━━━━━━━━━━━━━\n`; const mentions=[];
        all.forEach(([k,v])=>{ const uid=k.replace(chatId+'_',''); const bar='🟥'.repeat(v)+'⬜'.repeat(3-v); text+=`@${uid.split('@')[0]}: ${bar} ${v}/3\n`; mentions.push(uid); });
        await sock.sendMessage(chatId, { text: text+SIG, mentions }, { quoted: message });
    }
};
