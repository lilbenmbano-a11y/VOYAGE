const { reply } = require('./_helper');
const lines = [
    "Are you a magnet? Because I'm attracted to you.",
    "Do you have a map? I keep getting lost in your eyes.",
    "Is your name Google? Because you've got everything I've been searching for.",
    "Are you a parking ticket? Because you've got 'fine' written all over you.",
    "Do you believe in love at first text? Or should I message you again?",
    "Are you WiFi? Because I'm feeling a connection.",
    "If you were a vegetable, you'd be a cute-cumber.",
    "Are you a star? Because your beauty lights up the whole room.",
    "Do you have a charger? Because you just brought me back to life.",
    "Are you a camera? Because every time I look at you, I smile.",
    "If beauty were a crime, you'd be serving a life sentence.",
    "Are you a loan? Because you've got my interest.",
    "Do you like science? Because we've got chemistry.",
    "Are you a keyboard? Because you're just my type.",
    "If I could rearrange the alphabet, I'd put U and I together."
];
module.exports = async (sock, chatId, message) => {
    const line = lines[Math.floor(Math.random() * lines.length)];
    await reply(sock, chatId, `😏 *Rizz Line*\n\n💬 "${line}"`, message);
};
