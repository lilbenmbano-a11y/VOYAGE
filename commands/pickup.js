const { reply } = require('./_helper');
const pickups = [
    "Do you have a Band-Aid? Because I scraped my knee falling for you.",
    "Are you a time traveler? Because I see you in my future.",
    "Is your name Chapstick? Because you're da balm!",
    "Are you a dictionary? Because you add meaning to my life.",
    "Do you have a mirror in your pocket? Because I can see myself in your pants.",
    "Are you a campfire? Because you're hot and I want to be near you.",
    "If you were a fruit, you'd be a fineapple.",
    "Are you a cat? Because you're purr-fect.",
    "Do you like Star Wars? Because Yoda only one for me.",
    "Are you a broom? Because you swept me off my feet.",
    "Is your dad a baker? Because you're a cutie pie.",
    "Are you Netflix? Because I could watch you all day.",
    "Do you play soccer? Because you're a keeper.",
    "Are you a light switch? Because you turn me on."
];
module.exports = async (sock, chatId, message) => {
    const line = pickups[Math.floor(Math.random() * pickups.length)];
    await reply(sock, chatId, `💘 *Pick-Up Line*\n\n💬 "${line}"`, message);
};
