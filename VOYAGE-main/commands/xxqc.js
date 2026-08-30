const { reply } = require('./_helper');
const jokes = ['Why do programmers prefer dark mode? Because light attracts bugs! 🐛','I told my wife she should embrace her mistakes... She gave me a hug. 😂','Why dont scientists trust atoms? Because they make up everything! ⚛️','I asked my dog what 2 minus 2 is. He said nothing. 🐕','Why did the scarecrow win an award? He was outstanding in his field! 🌾'];
module.exports = async (sock, chatId, message) => {
    await reply(sock, chatId, `😂 *Random Joke*\n━━━━━━━━━━━━\n${jokes[Math.floor(Math.random()*jokes.length)]}`, message);
};
