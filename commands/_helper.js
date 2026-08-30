/**
 * voyage-xd — Command Helper DEFINITIVE
 * Uses production-tested isAdmin and isOwner with full @lid support
 * Signature: voyage-xd©
 */
const isAdminLib         = require('../lib/isAdmin');
const { makeIsOwner }    = require('../lib/isOwner');
const { getSender, getBotJid, normalizeJid, extractNum } = require('../lib/getSender');

const SIG = '\n\n_VOYAGE XD©_';

// Get isOwner function bound to this bot session's owner phone
// sock._ownerPhone is set in index.js when user pairs their number
function getIsOwner(sock) {
    const ownerPhone = sock._ownerPhone || process.env.OWNER_NUMBER || '';
    return makeIsOwner(ownerPhone);
}

// Check if sender is admin OR owner
// isOwner is async now (needs sock/chatId for @lid groups)
async function checkAdmin(sock, chatId, message) {
    const sender  = getSender(sock, message);
    const isOwner = getIsOwner(sock);

    // Owner always passes — pass sock and chatId for @lid resolution
    if (await isOwner(sender, sock, chatId)) return true;

    // In groups — check group admin status
    if (chatId.endsWith('@g.us')) {
        return await isAdminLib(sock, chatId, sender);
    }

    return false;
}

// Check if BOT is admin in the group
async function checkBotAdmin(sock, chatId) {
    if (!chatId.endsWith('@g.us')) return false;
    return await isAdminLib.isBotAdmin(sock, chatId);
}

// Get mentioned/quoted users from message
function getMentioned(message) {
    const list = [
        ...(message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [])
    ];
    const qp = message.message?.extendedTextMessage?.contextInfo?.participant;
    if (qp && !list.includes(qp)) list.push(qp);
    return list;
}

// Send reply with voyage-xd© signature
async function reply(sock, chatId, text, message) {
    return sock.sendMessage(
        chatId,
        { text: text + SIG },
        message ? { quoted: message } : {}
    );
}

module.exports = {
    checkAdmin,
    checkBotAdmin,
    getMentioned,
    reply,
    getSender,
    getBotJid,
    normalizeJid,
    extractNum,
    getIsOwner,
    isAdmin: isAdminLib,
    isOwner: require('../lib/isOwner'),
    SIG
};
