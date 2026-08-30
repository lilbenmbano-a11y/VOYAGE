const fs = require('fs');
const { getMentioned, reply, getSender, getIsOwner, SIG } = require('./_helper');
const FILE = './data/banned.json';
function getB() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return []; } }
function saveB(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
module.exports = async (sock, chatId, message) => {
    const sender = getSender(sock, message);
    const isOwner = getIsOwner(sock);
    if (!await isOwner(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const mentioned = getMentioned(message);
    if (!mentioned.length) return reply(sock, chatId, '❌ Usage: .ban @user', message);
    const banned = getB();
    for (const user of mentioned) {
        if (await isOwner(user, sock, chatId)) { await sock.sendMessage(chatId,{text:`❌ Cannot ban the owner.${SIG}`,mentions:[user]},{quoted:message}); continue; }
        if (banned.includes(user)) { await sock.sendMessage(chatId,{text:`⚠️ @${user.split('@')[0]} already banned.${SIG}`,mentions:[user]},{quoted:message}); continue; }
        banned.push(user); saveB(banned);
        await sock.sendMessage(chatId,{text:`🚫 @${user.split('@')[0]} banned.${SIG}`,mentions:[user]},{quoted:message});
    }
};
