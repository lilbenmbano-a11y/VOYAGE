const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    try {
        const parts = args.join(' ').split('|').map(s=>s.trim()).filter(Boolean);
        if (parts.length < 3) return reply(sock, chatId, '❌ Usage: .poll Question | Option1 | Option2\nExample: .poll Best fruit? | Apple | Mango | Banana', message);
        const question=parts[0]; const options=parts.slice(1).slice(0,12);
        try { await sock.sendMessage(chatId, { poll: { name: question, values: options, selectableCount: 1 } }); }
        catch {
            const nums=['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
            let text=`📊 *Poll: ${question}*\n\n`;
            options.forEach((o,i)=>{text+=`${nums[i]} ${o}\n`;}); text+=`\n_React to vote!_`;
            await reply(sock, chatId, text, message);
        }
    } catch { await reply(sock, chatId, '❌ Poll failed.', message); }
};
