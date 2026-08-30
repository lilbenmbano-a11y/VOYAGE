const { reply } = require('./_helper');
const facts = [
    "Honey never expires. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still good.",
    "A group of flamingos is called a 'flamboyance'.",
    "The average person walks about 100,000 miles in their lifetime.",
    "Octopuses have three hearts and blue blood.",
    "Bananas are technically berries, but strawberries are not.",
    "There are more possible iterations of a game of chess than there are atoms in the observable universe.",
    "The Eiffel Tower can grow up to 6 inches taller in summer due to thermal expansion.",
    "Wombat poop is cube-shaped.",
    "A cloud can weigh more than a million pounds.",
    "Sharks are older than trees — they've been around for 450 million years.",
    "Your nose can detect over 1 trillion different smells.",
    "The longest hiccuping episode in history lasted 68 years.",
    "Cows have best friends and get stressed when they're separated.",
    "It rains diamonds on Neptune and Uranus.",
    "A snail can sleep for 3 years."
];
module.exports = async (sock, chatId, message) => {
    const f = facts[Math.floor(Math.random() * facts.length)];
    await reply(sock, chatId, `🧠 *Fun Fact*\n\n${f}`, message);
};
