const { reply, getSender, getMentioned } = require('./_helper');
const compliments = [
    "You light up every room you walk into.",
    "Your smile could end wars.",
    "You have the kind of vibe that makes everyone feel welcome.",
    "You're not just smart — you're dangerously clever.",
    "The world is genuinely better because you're in it.",
    "You handle everything with such grace and strength.",
    "You have a rare ability to make people feel truly seen.",
    "Your energy is absolutely magnetic.",
    "You bring out the best in people without even trying.",
    "You are the definition of 'main character energy'.",
    "Your dedication is something most people can only dream of.",
    "You somehow manage to be both humble and impressive.",
    "You've got that rare mix of kindness and confidence."
];
module.exports = async (sock, chatId, message) => {
    const mentioned = getMentioned(message);
    const c = compliments[Math.floor(Math.random() * compliments.length)];
    if (mentioned.length > 0) {
        const tag = `@${mentioned[0].split('@')[0]}`;
        await sock.sendMessage(chatId, {
            text: `💝 *Compliment for ${tag}*\n\n"${c}"\n\n_VOYAGE XD©_`,
            mentions: mentioned
        }, { quoted: message });
    } else {
        await reply(sock, chatId, `💝 *Compliment*\n\n"${c}"`, message);
    }
};
