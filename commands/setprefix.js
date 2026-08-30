const fs = require('fs');
const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const prefix = args[0]?.trim();
    if (!prefix || prefix.length > 3) return reply(sock, chatId, '❌ Usage: .setprefix <symbol>\nMax 3 characters', message);
    try {
        const settingsPath = './settings.js';
        let content = fs.readFileSync(settingsPath, 'utf8');
        content = content.replace(/prefix:\s*'[^']*'/, `prefix: '${prefix}'`);
        fs.writeFileSync(settingsPath, content);
        await reply(sock, chatId, `✅ Prefix changed to: *${prefix}*\n_Restart for full effect._`, message);
    } catch { await reply(sock, chatId, '❌ Failed.', message); }
};
