const fs = require('fs');
const { checkAdmin, checkBotAdmin, reply, SIG } = require('./_helper');
const FILE = './data/msgcount.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {}; } }
module.exports = async (sock, chatId, message, args) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);
    if (!await checkBotAdmin(sock, chatId)) return reply(sock, chatId, '❌ Make me admin first.', message);
    const minMsgs = parseInt(args[0]) || 5;
    const data = get(); const groupData = data[chatId] || {};
    const meta = await sock.groupMetadata(chatId);
    const inactive = meta.participants.filter(p => !p.admin && (groupData[p.id]||0) < minMsgs).map(p=>p.id);
    if (!inactive.length) return reply(sock, chatId, `✅ No inactive members (< ${minMsgs} messages).`, message);
    await reply(sock, chatId, `⚠️ Kicking ${inactive.length} inactive members (< ${minMsgs} msgs)...`, message);
    for (const m of inactive) { try { await sock.groupParticipantsUpdate(chatId,[m],'remove'); await new Promise(r=>setTimeout(r,500)); } catch {} }
    await sock.sendMessage(chatId, { text: `✅ Kicked ${inactive.length} inactive members.${SIG}` });
};
