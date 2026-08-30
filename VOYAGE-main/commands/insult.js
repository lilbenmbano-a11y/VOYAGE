const { getMentioned, reply, SIG } = require('./_helper');
const I=["You're the reason the gene pool needs a lifeguard. 🏊","You have the personality of a wet sock. 🧦","Even your Wi-Fi has more personality than you. 📶","You're so slow, you'd be late to your own funeral. ⚰️"];
module.exports = async (sock, chatId, message) => {
    const mentioned=getMentioned(message); const ins=I[Math.floor(Math.random()*I.length)];
    if (!mentioned.length) return reply(sock, chatId, `😂 *Funny Insult*\n\n${ins}\n\n_All in good fun!_`, message);
    await sock.sendMessage(chatId,{text:`😂 *@${mentioned[0].split('@')[0]}*\n\n${ins}\n\n_All in good fun!_${SIG}`,mentions:[mentioned[0]]},{quoted:message});
};
