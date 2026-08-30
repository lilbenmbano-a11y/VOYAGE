const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const bio = args.join(' ').trim();
    if (!bio) return reply(sock, chatId, '❌ Usage: .setbio <text>', message);
    try { await sock.updateProfileStatus(bio); await reply(sock, chatId, `✅ Bio updated to: _${bio}_`, message); }
    catch { await reply(sock, chatId, '❌ Failed to update bio.', message); }
};
