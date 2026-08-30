const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const tz = args.join(' ').trim() || 'Africa/Harare';
    try {
        const now = new Date().toLocaleString('en-US',{timeZone:tz,dateStyle:'full',timeStyle:'long'});
        await reply(sock, chatId, `🕐 *Time*\n\n📍 ${tz}\n🕐 ${now}`, message);
    } catch { await reply(sock, chatId, `❌ Invalid timezone: ${tz}\nExample: .time Africa/Lagos`, message); }
};
