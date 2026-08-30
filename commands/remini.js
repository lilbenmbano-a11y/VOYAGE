const { downloadContentFromMessage } = require('@crysnovax/baileys');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    await reply(sock, chatId, `✨ *Remini / AI Enhance*\n━━━━━━━━━━━━\nFor AI photo enhancement:\n\n📱 Use the *Remini* app (free)\n🌐 Or try: remini.ai\n🖼️ Or: waifu2x.net for anime\n\n_Direct AI enhancement requires paid APIs._`, message);
};
