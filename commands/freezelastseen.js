const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const sub = args[0]?.toLowerCase();
    if (!sub) return reply(sock, chatId, '❌ Usage: .freezelastseen on/off\n\n_Hides last seen from everyone_', message);
    try {
        if (sub === 'on') {
            await sock.updateLastSeenPrivacy('none');
            await reply(sock, chatId, '✅ Last seen *frozen/hidden* from everyone!', message);
        } else {
            await sock.updateLastSeenPrivacy('all');
            await reply(sock, chatId, '❌ Last seen visible to *everyone*.', message);
        }
    } catch { await reply(sock, chatId, '❌ Failed.', message); }
};
