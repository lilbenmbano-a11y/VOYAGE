const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const q = args.join(' ').trim();
    if (!q) return reply(sock, chatId, '❌ Usage: .deepseek <question>', message);
    await sock.sendMessage(chatId, { text: '🧠 *DeepSeek AI* thinking...' }, { quoted: message });
    try {
        const res = await axios.post('https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
            { inputs: q, parameters: { max_new_tokens: 300, return_full_text: false } },
            { headers: { 'Content-Type': 'application/json' }, timeout: 30000 });
        let ans = Array.isArray(res.data) ? res.data[0]?.generated_text : res.data?.generated_text;
        ans = (ans || 'No response').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        await reply(sock, chatId, `🧠 *DeepSeek AI*\n━━━━━━━━━━━━\n❓ ${q}\n\n💬 ${ans}`, message);
    } catch { await reply(sock, chatId, '❌ DeepSeek unavailable. Try .ai instead.', message); }
};
