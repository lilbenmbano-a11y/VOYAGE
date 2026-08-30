const { reply } = require('./_helper');
const adviceList = [
    "Don't compare your chapter 1 to someone else's chapter 20.",
    "The best time to start was yesterday. The second best time is now.",
    "You don't have to have it all figured out to move forward.",
    "Small progress is still progress.",
    "Stop waiting for the perfect moment. Take the moment and make it perfect.",
    "Surround yourself with people who push you to do and be better.",
    "Your only competition is who you were yesterday.",
    "Overthinking is the art of creating problems that weren't even there.",
    "What you allow is what will continue.",
    "Be the energy you want to attract.",
    "Discipline is choosing between what you want now and what you want most.",
    "Your vibe is your currency — spend it wisely.",
    "Sometimes the best answer is a good night's sleep.",
    "Don't let the opinion of others become your reality.",
    "Consistency beats motivation every single time."
];
module.exports = async (sock, chatId, message) => {
    const a = adviceList[Math.floor(Math.random() * adviceList.length)];
    await reply(sock, chatId, `💡 *Daily Advice*\n\n"${a}"`, message);
};
