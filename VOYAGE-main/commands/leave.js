const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    await reply(sock, chatId, '👋 Leaving group...', message);
    await new Promise(r=>setTimeout(r,1000));
    await sock.groupLeave(chatId);
};
