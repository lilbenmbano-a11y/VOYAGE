/**
 * getpp — Get profile picture of a user
 * getbio — Get bio/status of a user
 */
const { reply, getSender } = require('./_helper');

async function getpp(sock, chatId, message) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted    = message.message?.extendedTextMessage?.contextInfo?.quotedParticipant;
    const target    = mentioned[0] || quoted || getSender(sock, message);

    try {
        const ppUrl = await sock.profilePictureUrl(target, 'image');
        await sock.sendMessage(chatId, {
            image:   { url: ppUrl },
            caption: `🖼️ *Profile Picture*\n👤 @${target.split('@')[0]}\n\n_VOYAGE XD©_`,
            mentions: [target],
        }, { quoted: message });
    } catch {
        await reply(sock, chatId, `❌ No profile picture found or it's private.`, message);
    }
}

async function getbio(sock, chatId, message) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted    = message.message?.extendedTextMessage?.contextInfo?.quotedParticipant;
    const target    = mentioned[0] || quoted || getSender(sock, message);

    try {
        const status = await sock.fetchStatus(target);
        const bio    = status?.status || 'No bio set.';
        await sock.sendMessage(chatId, {
            text: `📝 *Bio/Status*\n👤 @${target.split('@')[0]}\n\n"${bio}"\n\n_VOYAGE XD©_`,
            mentions: [target],
        }, { quoted: message });
    } catch {
        await reply(sock, chatId, `❌ Bio is private or unavailable.`, message);
    }
}

module.exports = { getpp, getbio };
