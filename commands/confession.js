const { reply } = require('./_helper');
const confessions = [
    "I sometimes talk to myself and give myself advice that I never follow.",
    "I've watched the same movie over 10 times and cried every single time.",
    "I pretend to be on my phone to avoid talking to people.",
    "I've eaten food that fell on the floor more times than I can count.",
    "I still check under my bed at night... just in case.",
    "I've Googled myself more than once.",
    "I laugh at my own jokes before I finish telling them.",
    "I've definitely sniffed my clothes to check if they're clean.",
    "I rehearse conversations in my head before actually having them.",
    "I've stayed up way too late just watching strangers' life videos online.",
    "Sometimes I pretend I didn't see a message so I don't have to reply immediately.",
    "I've cried during an animated movie more than once.",
    "I talk to my plants and I'm convinced they like it.",
    "I've definitely judged someone's playlist and then secretly listened to it."
];
module.exports = async (sock, chatId, message) => {
    const c = confessions[Math.floor(Math.random() * confessions.length)];
    await reply(sock, chatId, `🤫 *Random Confession*\n\n"${c}"`, message);
};
