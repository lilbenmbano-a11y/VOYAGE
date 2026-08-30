const fs = require('fs');
const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    const sender = getSender(sock, message);
    const isOwner = getIsOwner(sock);
    if (!await isOwner(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const f = './data/session_backup.b64';
    if (!fs.existsSync(f)) return reply(sock, chatId, '❌ No session backup yet. Restart bot first.', message);
    const data = fs.readFileSync(f, 'utf8');
    await reply(sock, chatId, '🔐 *SESSION_ID*\n\nSave this as SESSION_ID env variable on Render to skip re-pairing on restart.', message);
    await sock.sendMessage(chatId, { document: Buffer.from(data), fileName: 'SESSION_ID.txt', mimetype: 'text/plain', caption: '📎 Copy all contents → Set as SESSION_ID env variable' });
};
