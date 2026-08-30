const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    await reply(sock, chatId, '♻️ *Restarting bot...*\n\nWill be back online in a moment!', message);
    setTimeout(() => process.exit(0), 2000);
};
