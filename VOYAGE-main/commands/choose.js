const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const opts = args.join(' ').split(',').map(s=>s.trim()).filter(Boolean);
    if (opts.length < 2) return reply(sock, chatId, '❌ Usage: .choose option1, option2, option3', message);
    await reply(sock, chatId, `🎯 *I choose...*\n\n*${opts[Math.floor(Math.random()*opts.length)]}*\n\n_From: ${opts.join(', ')}_`, message);
};
