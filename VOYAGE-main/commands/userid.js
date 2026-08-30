const { getMentioned, reply, getSender, SIG } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    const mentioned = getMentioned(message);
    const targets = mentioned.length ? mentioned : [getSender(sock, message)];
    let text = `🆔 *User ID*\n━━━━━━━━━━━━\n`;
    targets.forEach(t => { text += `📱 @${t.split('@')[0]}\n🆔 \`${t}\`\n\n`; });
    await sock.sendMessage(chatId, { text: text+SIG, mentions: targets }, { quoted: message });
};
