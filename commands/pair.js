const { reply, getSender, getIsOwner } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const sender = getSender(sock, message);
    const isOwner = getIsOwner(sock);
    if (!await isOwner(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    
    const phone = args[0]?.replace(/[^0-9]/g,'');
    if (!phone) return reply(sock, chatId, '❌ Usage: .pair <number>', message);
    
    // Trigger the safe pairing flow via the bot's own HTTP endpoint
    try {
        const fetch = require('node-fetch');
        const res = await fetch(`http://localhost:${process.env.PORT || 3100}/pair`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });
        const data = await res.json();
        if (data.success && data.code) {
            await reply(sock, chatId, `✅ *Pairing Code*\n\n📱 +${phone}\n🔐 *${data.code}*\n\n⏰ Expires in 5 minutes`, message);
        } else if (data.status === 'already_connected') {
            await reply(sock, chatId, `✅ +${phone} is already connected.`, message);
        } else {
            await reply(sock, chatId, `❌ Failed: ${data.error || 'Unknown error'}`, message);
        }
    } catch(e) { 
        await reply(sock, chatId, `❌ Failed: ${e.message}`, message); 
    }
};
