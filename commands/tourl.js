const { downloadContentFromMessage } = require('@crysnovax/baileys');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    await reply(sock, chatId, `🔗 *Media to URL*\n━━━━━━━━━━━━\nTo get a direct URL for media:\n\n1. Upload to Imgur: imgur.com\n2. Upload to Catbox: catbox.moe\n3. Upload to Telegraph: telegra.ph\n\n_Direct media hosting via bot is not supported._`, message);
};
