const { getMentioned, reply, SIG } = require('./_helper');
const C=["You have the most incredible smile! 😊","You're one of the most genuine people! 💯","Your kindness is a superpower! 💪","You make the world a better place! 🌍","You're stronger than you know! 🦁"];
module.exports = async (sock, chatId, message) => {
    const mentioned=getMentioned(message); const comp=C[Math.floor(Math.random()*C.length)];
    if (!mentioned.length) return reply(sock, chatId, `💌 *Compliment*\n\n${comp}`, message);
    await sock.sendMessage(chatId,{text:`💌 *For @${mentioned[0].split('@')[0]}*\n\n${comp}${SIG}`,mentions:[mentioned[0]]},{quoted:message});
};
