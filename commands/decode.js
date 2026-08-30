const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, '❌ Usage: .decode <base64>', message);
    try { await reply(sock, chatId, `🔓 *Decoded:*\n\n${Buffer.from(text,'base64').toString('utf8')}`, message); }
    catch { await reply(sock, chatId, '❌ Invalid base64.', message); }
};
