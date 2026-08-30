/**
 * VoyageXD — isAdmin DEFINITIVE
 * Handles @s.whatsapp.net, @lid, device suffixes, phoneNumber field
 * Adapted from production-tested code
 */
const cache = new Map();
const TTL   = 5000;

async function getMeta(sock, gid) {
    const c = cache.get(gid);
    if (c && Date.now() - c.ts < TTL) return c.data;
    const data = await sock.groupMetadata(gid);
    cache.set(gid, { data, ts: Date.now() });
    return data;
}

// Extract pure numeric part from any JID format
function extractNum(id) {
    if (!id) return '';
    // e.g. "263788114185:5@s.whatsapp.net" → "263788114185"
    //      "30997433344120:4@lid"          → "30997433344120"
    //      "263788114185@s.whatsapp.net"   → "263788114185"
    return id.split(':')[0].split('@')[0];
}

function normalizeJid(jid) {
    if (!jid || typeof jid !== 'string') return '';
    const s = jid.replace(/:\d+@/, '@');
    if (s.includes('@')) return s.toLowerCase().trim();
    return s.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
}

async function isAdmin(sock, gid, uid) {
    try {
        if (!sock || !gid || !uid) return false;

        const meta = await getMeta(sock, gid);
        const participants = meta.participants || [];

        const senderNum            = extractNum(uid);
        const senderFull           = uid;
        const senderWithoutSuffix  = uid.includes('@') ? uid.split('@')[0] : uid;

        const isSenderAdmin = participants.some(p => {
            const pPhoneNum = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';
            const pId       = p.id  ? p.id.split('@')[0]  : '';
            const pLid      = p.lid ? p.lid.split('@')[0] : '';
            const pFullId   = p.id  || '';
            const pFullLid  = p.lid || '';

            const matches = (
                senderFull          === pFullId   ||   // direct ID match
                senderFull          === pFullLid  ||   // direct LID match
                senderNum           === pPhoneNum ||   // phone number match
                senderNum           === pId       ||   // ID portion match
                senderWithoutSuffix === pPhoneNum ||   // without-suffix vs phone
                senderWithoutSuffix === pId       ||   // without-suffix vs ID
                (pLid && senderWithoutSuffix === pLid) // LID match
            );

            return matches && (p.admin === 'admin' || p.admin === 'superadmin');
        });

        return isSenderAdmin;
    } catch (e) {
        console.error('[isAdmin] Error:', e.message);
        return false;
    }
}

async function isBotAdmin(sock, gid) {
    try {
        if (!sock || !gid) return false;

        const meta = await getMeta(sock, gid);
        const participants = meta.participants || [];

        const botId  = sock.user?.id  || '';
        const botLid = sock.user?.lid || '';

        const botNum             = extractNum(botId);
        const botIdWithout       = botId.includes('@')  ? botId.split('@')[0]  : botId;
        const botLidNumeric      = botLid.includes(':') ? botLid.split(':')[0] : (botLid.includes('@') ? botLid.split('@')[0] : botLid);
        const botLidWithoutSuffix= botLid.includes('@') ? botLid.split('@')[0] : botLid;

        const result = participants.some(p => {
            const pPhoneNum  = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';
            const pId        = p.id  ? p.id.split('@')[0]  : '';
            const pLid       = p.lid ? p.lid.split('@')[0] : '';
            const pFullId    = p.id  || '';
            const pFullLid   = p.lid || '';
            const pLidNumeric= pLid.includes(':') ? pLid.split(':')[0] : pLid;

            const botMatches = (
                botId             === pFullId         ||
                botId             === pFullLid        ||
                botLid            === pFullLid        ||
                botLidNumeric     === pLidNumeric     ||
                botLidWithoutSuffix === pLid          ||
                botNum            === pPhoneNum       ||
                botNum            === pId             ||
                botIdWithout      === pPhoneNum       ||
                botIdWithout      === pId             ||
                (botLid && botLid.split('@')[0].split(':')[0] === pLid)
            );

            return botMatches && (p.admin === 'admin' || p.admin === 'superadmin');
        });

        return result;
    } catch (e) {
        console.error('[isBotAdmin] Error:', e.message);
        return false;
    }
}

async function getAdmins(sock, gid) {
    try {
        const meta = await getMeta(sock, gid);
        return (meta.participants || []).filter(p => p.admin).map(p => normalizeJid(p.id));
    } catch { return []; }
}

module.exports              = isAdmin;
module.exports.isAdmin      = isAdmin;
module.exports.isBotAdmin   = isBotAdmin;
module.exports.getAdmins    = getAdmins;
module.exports.normalizeJid = normalizeJid;
module.exports.extractNum   = extractNum;
module.exports.num          = extractNum;
