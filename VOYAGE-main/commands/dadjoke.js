const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    try {
        const r = await axios.get('https://icanhazdadjoke.com/',{headers:{Accept:'application/json'},timeout:8000});
        await reply(sock, chatId, `👨 *Dad Joke*\n\n${r.data.joke}`, message);
    } catch { await reply(sock, chatId, `👨 *Dad Joke*\n\nI used to hate facial hair, but then it grew on me.`, message); }
};
