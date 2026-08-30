const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    try {
        if (args.length < 3) return reply(sock, chatId, '❌ Usage: .currency <amount> <from> <to>\nExample: .currency 100 USD ZWL', message);
        const amount=parseFloat(args[0]), from=args[1].toUpperCase(), to=args[2].toUpperCase();
        if (isNaN(amount)) return reply(sock, chatId, '❌ Amount must be a number.', message);
        const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`,{timeout:10000});
        const rate = res.data.rates[to];
        if (!rate) return reply(sock, chatId, `❌ Currency *${to}* not found.`, message);
        await reply(sock, chatId, `💱 *Currency*\n\n💵 ${amount} *${from}* = 💰 *${(amount*rate).toFixed(2)} ${to}*\n📊 Rate: 1 ${from} = ${rate.toFixed(4)} ${to}`, message);
    } catch { await reply(sock, chatId, '❌ Conversion failed.', message); }
};
