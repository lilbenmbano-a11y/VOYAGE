const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    try {
        const r = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple', { timeout: 10000 });
        const q = r.data.results[0];
        const all = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random()-0.5);
        const letters = ['A','B','C','D'];
        let text = `🧠 *Trivia*\n━━━━━━━━━━━━\n📚 ${decodeURIComponent(q.category)}\n⚡ ${q.difficulty.toUpperCase()}\n\n❓ ${decodeURIComponent(q.question)}\n\n`;
        all.forEach((a,i) => { text += `${letters[i]}. ${decodeURIComponent(a)}\n`; });
        text += `\n_Reply with the letter! Answer in 30 seconds._`;
        await reply(sock, chatId, text, message);
        setTimeout(async () => {
            await sock.sendMessage(chatId, { text: `⏰ *Time's up!*\n\n✅ Answer: *${decodeURIComponent(q.correct_answer)}*\n\n_TunzyMD©_` });
        }, 30000);
    } catch { await reply(sock, chatId, '❌ Could not fetch trivia.', message); }
};
