const axios = require('axios');
const { reply } = require('./_helper');
const fallback=["Why don't scientists trust atoms? Because they make up everything! 😂","I'd agree with you but then we'd both be wrong. 😄","You're the reason shampoo has instructions. 😂"];
module.exports = async (sock, chatId, message) => {
    try {
        const res = await axios.get('https://v2.jokeapi.dev/joke/Any?blacklistFlags=racist,sexist&safe-mode',{timeout:8000});
        const d=res.data; const text=d.type==='single'?d.joke:`*Q:* ${d.setup}\n\n*A:* ${d.delivery}`;
        await reply(sock, chatId, `😂 *Joke*\n\n${text}`, message);
    } catch { await reply(sock, chatId, `😂 *Joke*\n\n${fallback[Math.floor(Math.random()*fallback.length)]}`, message); }
};
