/**
 * VoyageXD — isOwner DEFINITIVE
 * Handles @s.whatsapp.net, @lid, device suffixes
 * Adapted from production-tested code
 */
const fs = require('fs');

function extractNum(id) {
    if (!id) return '';
    return id.split(':')[0].split('@')[0];
}

function makeIsOwner(ownerPhone) {
    const ownerNumberClean = extractNum(ownerPhone);

    return async function isOwner(senderId, sock = null, chatId = null) {
        if (!senderId) return false;

        const ownerJid     = ownerNumberClean + '@s.whatsapp.net';
        const senderClean  = extractNum(senderId);
        const senderLidNum = senderId.includes('@lid')
            ? senderId.split('@')[0].split(':')[0]
            : '';

        // 1. Direct JID match
        if (senderId === ownerJid) return true;

        // 2. Phone number match
        if (senderClean === ownerNumberClean) return true;

        // 3. Check OWNER_NUMBER env var
        if (process.env.OWNER_NUMBER) {
            const envClean = extractNum(process.env.OWNER_NUMBER);
            if (envClean && senderClean === envClean) return true;
        }

        // 4. @lid handling in groups (new Baileys format)
        if (sock && chatId && chatId.endsWith('@g.us') && senderId.includes('@lid')) {
            try {
                const botLid     = sock.user?.lid || '';
                const botLidNum  = botLid.includes(':')
                    ? botLid.split(':')[0]
                    : (botLid.includes('@') ? botLid.split('@')[0] : botLid);

                // Bot LID numeric match
                if (senderLidNum && botLidNum && senderLidNum === botLidNum) return true;

                // Check via participant list
                const metadata     = await sock.groupMetadata(chatId);
                const participants = metadata.participants || [];

                const participant = participants.find(p => {
                    const pLid     = p.lid || '';
                    const pLidNum  = pLid.includes(':')
                        ? pLid.split(':')[0]
                        : (pLid.includes('@') ? pLid.split('@')[0] : pLid);
                    const pIdClean = extractNum(p.id || '');

                    return (
                        p.lid === senderId         ||
                        p.id  === senderId         ||
                        pLidNum  === senderLidNum  ||
                        pIdClean === senderClean   ||
                        pIdClean === ownerNumberClean
                    );
                });

                if (participant) {
                    const pIdClean  = extractNum(participant.id  || '');
                    const pLid      = participant.lid || '';
                    const pLidNum   = pLid.includes(':')
                        ? pLid.split(':')[0]
                        : (pLid.includes('@') ? pLid.split('@')[0] : pLid);

                    if (
                        participant.id === ownerJid   ||
                        pIdClean === ownerNumberClean ||
                        pLidNum  === botLidNum
                    ) return true;
                }
            } catch (e) {
                console.error('[isOwner] @lid check error:', e.message);
            }
        }

        // 5. Fallback — senderId contains owner number
        if (ownerNumberClean && senderId.includes(ownerNumberClean)) return true;

        // 6. Check data/owner.json
        try {
            const f = './data/owner.json';
            if (fs.existsSync(f)) {
                const list = JSON.parse(fs.readFileSync(f, 'utf8'));
                if (Array.isArray(list) && list.some(o => extractNum(o) === senderClean)) return true;
            }
        } catch {}

        return false;
    };
}

// Default isOwner — uses env var
async function isOwner(userId, sock, chatId) {
    return makeIsOwner(process.env.OWNER_NUMBER || '')(userId, sock, chatId);
}

module.exports           = isOwner;
module.exports.isOwner   = isOwner;
module.exports.makeIsOwner = makeIsOwner;
module.exports.extractNum  = extractNum;
module.exports.num         = extractNum;
