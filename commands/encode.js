const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, '❌ Usage: .encode <text>', message);
    await reply(sock, chatId, `🔒 *Base64:*\n\n${Buffer.from(text).toString('base64')}`, message);
};
