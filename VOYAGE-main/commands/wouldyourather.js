const { reply } = require('./_helper');
const questions = [
    "Would you rather be able to fly OR be invisible?",
    "Would you rather lose all your money OR lose all your contacts?",
    "Would you rather be always 10 minutes late OR always 20 minutes early?",
    "Would you rather never use social media again OR never watch movies/TV again?",
    "Would you rather know how you die OR know when you die?",
    "Would you rather have unlimited data OR unlimited battery life?",
    "Would you rather live in the past OR live in the future?",
    "Would you rather be famous but hated OR unknown but loved?",
    "Would you rather only be able to whisper OR only be able to shout?",
    "Would you rather eat only junk food OR exercise 3 hours every day?",
    "Would you rather have more money OR more time?",
    "Would you rather be too hot OR too cold?",
    "Would you rather lose your phone OR lose your wallet?",
    "Would you rather speak every language OR play every instrument?"
];
module.exports = async (sock, chatId, message) => {
    const q = questions[Math.floor(Math.random() * questions.length)];
    await reply(sock, chatId, `🤔 *Would You Rather?*\n\n${q}\n\nReply with *A* or *B*!`, message);
};
