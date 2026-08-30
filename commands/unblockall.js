const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    try {
        const blocked = await sock.fetchBlocklist();
        if (!blocked.length) return reply(sock, chatId, '✅ No blocked contacts.', message);
        for (const jid of blocked) { try { await sock.updateBlockStatus(jid,'unblock'); } catch {} }
        await reply(sock, chatId, `✅ Unblocked *${blocked.length}* contacts.`, message);
    } catch { await reply(sock, chatId, '❌ Failed.', message); }
};
