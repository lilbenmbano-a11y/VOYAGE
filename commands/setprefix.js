const { reply, getSender, getIsOwner } = require('./_helper');
const userState = require('../lib/userState');

module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    if (!await getIsOwner(sock)(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const prefix = args[0]?.trim();
    if (!prefix || prefix.length > 3) return reply(sock, chatId, '❌ Usage: .setprefix <symbol>\nMax 3 characters', message);
    try {
        // ✅ Per-user prefix — stored under this WhatsApp account's own
        // state file, so it never affects (or gets overwritten by) any
        // other user's session, and takes effect immediately (no restart
        // needed, unlike the old approach of rewriting settings.js on disk).
        userState.setPrefix(sock._ownerPhone, prefix);
        await reply(sock, chatId, `✅ Prefix changed to: *${prefix}*`, message);
    } catch { await reply(sock, chatId, '❌ Failed.', message); }
};
