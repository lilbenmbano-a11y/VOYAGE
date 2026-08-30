const { getMentioned, reply, SIG } = require('./_helper');
const R=["You're the human equivalent of a participation trophy. 🏆","I'd explain it but I don't have crayons. 🖍️","You're the reason they put instructions on shampoo. 😂","You bring joy whenever you leave the room. 🚪","Your Wi-Fi signal has more personality than you. 📶"];
module.exports = async (sock, chatId, message) => {
    const mentioned=getMentioned(message); const roast=R[Math.floor(Math.random()*R.length)];
    if (!mentioned.length) return reply(sock, chatId, `🔥 *Roast*\n\n${roast}`, message);
    await sock.sendMessage(chatId,{text:`🔥 *Roasting @${mentioned[0].split('@')[0]}*\n\n${roast}${SIG}`,mentions:[mentioned[0]]},{quoted:message});
};
