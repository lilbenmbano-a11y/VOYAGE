const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const q = args.join(' ').trim();
    if (!q) return reply(sock, chatId, '❌ Usage: .teach <topic>\nExample: .teach how does wifi work', message);
    await sock.sendMessage(chatId, { text: '📚 Teaching you...' }, { quoted: message });
    try {
        const res = await axios.post('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
            { inputs: `<s>[INST] Explain this simply and clearly in a few paragraphs: ${q} [/INST]`, parameters: { max_new_tokens: 400, return_full_text: false } },
            { headers: { 'Content-Type': 'application/json' }, timeout: 30000 });
        let ans = Array.isArray(res.data) ? res.data[0]?.generated_text : res.data?.generated_text;
        ans = (ans || 'No response').replace(/\[INST\]|\[\/INST\]|<\/?s>/g, '').trim();
        await reply(sock, chatId, `📚 *Lesson: ${q}*\n━━━━━━━━━━━━\n\n${ans}`, message);
    } catch { await reply(sock, chatId, '❌ AI unavailable. Try again later.', message); }
};
