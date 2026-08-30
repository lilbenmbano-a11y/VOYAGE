const fs = require('fs');
const { getMentioned, reply, getSender, getIsOwner, SIG } = require('./_helper');
const FILE = './data/banned.json';
function getB() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return []; } }
module.exports = async (sock, chatId, message) => {
    const sender = getSender(sock, message);
    const isOwner = getIsOwner(sock);
    if (!await isOwner(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const mentioned = getMentioned(message);
    if (!mentioned.length) return reply(sock, chatId, '❌ Usage: .unban @user', message);
    let banned = getB();
    for (const user of mentioned) {
        if (!banned.includes(user)) { await sock.sendMessage(chatId,{text:`⚠️ @${user.split('@')[0]} not banned.${SIG}`,mentions:[user]},{quoted:message}); continue; }
        banned = banned.filter(u=>u!==user); fs.writeFileSync(FILE,JSON.stringify(banned,null,2));
        await sock.sendMessage(chatId,{text:`✅ @${user.split('@')[0]} unbanned.${SIG}`,mentions:[user]},{quoted:message});
    }
};
