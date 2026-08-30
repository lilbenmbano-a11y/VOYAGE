const fs = require('fs');
const { checkAdmin, getMentioned, reply, SIG } = require('./_helper');
const FILE = './data/warnings.json';
function getW() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {}; } }
function saveW(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
module.exports = async (sock, chatId, message) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ You need to be an admin.', message);
    const mentioned = getMentioned(message);
    if (!mentioned.length) return reply(sock, chatId, '❌ Usage: .warn @user', message);
    const w = getW(), max = 3;
    for (const user of mentioned) {
        const key = `${chatId}_${user}`; w[key] = (w[key]||0)+1; saveW(w);
        if (w[key] >= max) {
            await sock.sendMessage(chatId, { text: `⛔ @${user.split('@')[0]} got *${w[key]}/${max}* warnings and was kicked!${SIG}`, mentions: [user] });
            try { await sock.groupParticipantsUpdate(chatId,[user],'remove'); } catch {}
            w[key]=0; saveW(w);
        } else {
            await sock.sendMessage(chatId, { text: `⚠️ *Warning ${w[key]}/${max}*\n@${user.split('@')[0]}, watch yourself!\n_${max-w[key]} more = kick_${SIG}`, mentions: [user] }, { quoted: message });
        }
    }
};
