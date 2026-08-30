const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    const isOwner = getIsOwner(sock);
    if (!await isOwner(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const phone = args[0]?.replace(/[^0-9]/g,'');
    if (!phone) return reply(sock, chatId, '❌ Usage: .pair <number>', message);
    try {
        let code = await sock.requestPairingCode(phone);
        code = code?.match(/.{1,4}/g)?.join('-') || code;
        await reply(sock, chatId, `✅ *Pairing Code*\n\n📱 +${phone}\n🔐 *${code}*\n\n⏰ Expires in 5 minutes`, message);
    } catch(e) { await reply(sock, chatId, `❌ Failed: ${e.message}`, message); }
};
