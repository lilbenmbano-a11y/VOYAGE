const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const text = args.join(' ').trim();
    if (!text) return reply(sock, chatId, '❌ Usage: .lower <text>', message);
    await reply(sock, chatId, text.toLowerCase(), message);
};
