const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const sub = args[0]?.toLowerCase() || 'on';
    if (sub === 'on') {
        await sock.sendPresenceUpdate('available');
        await reply(sock, chatId, '✅ Bot is now *online*!', message);
    } else {
        await sock.sendPresenceUpdate('unavailable');
        await reply(sock, chatId, '⭕ Bot is now *offline*!', message);
    }
};
