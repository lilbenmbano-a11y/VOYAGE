const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    try {
        const expr = args.join(' ').trim();
        if (!expr) return reply(sock, chatId, '❌ Usage: .calc <expression>', message);
        if (!/^[\d\s\+\-\*\/\(\)\.\%]+$/.test(expr)) return reply(sock, chatId, '❌ Only numbers and operators allowed.', message);
        const result = Function('"use strict";return (' + expr + ')')();
        await reply(sock, chatId, `🧮 *Calculator*\n\n📥 ${expr}\n📤 *${result}*`, message);
    } catch { await reply(sock, chatId, '❌ Invalid expression.', message); }
};
