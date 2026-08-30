/**
 * VoyageXD — getSender DEFINITIVE
 * Handles all message types including @lid JIDs
 */
function extractNum(id) {
    if (!id) return '';
    return id.split(':')[0].split('@')[0];
}

function normalizeJid(jid) {
    if (!jid || typeof jid !== 'string') return '';
    const s = jid.replace(/:\d+@/, '@');
    if (s.includes('@')) return s.toLowerCase().trim();
    return s.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
}

function getSender(sock, message) {
    try {
        const isGroup = message.key?.remoteJid?.endsWith('@g.us');
        let raw = '';

        if (message.key.fromMe) {
            raw = sock.user?.id || '';
        } else if (isGroup) {
            // participant field is the real sender in groups
            raw = message.key.participant
                || message.message?.extendedTextMessage?.contextInfo?.participant
                || message.message?.imageMessage?.contextInfo?.participant
                || message.message?.videoMessage?.contextInfo?.participant
                || message.message?.stickerMessage?.contextInfo?.participant
                || message.message?.documentMessage?.contextInfo?.participant
                || message.message?.audioMessage?.contextInfo?.participant
                || '';
        } else {
            raw = message.key.remoteJid || '';
        }

        // Return as-is (preserving @lid if present) — isAdmin/isOwner handle all formats
        if (!raw) return '';
        
        // Only normalize @s.whatsapp.net JIDs, leave @lid intact
        if (raw.includes('@lid')) return raw.toLowerCase().trim();
        return normalizeJid(raw);
    } catch {
        return '';
    }
}

function getBotJid(sock) {
    return normalizeJid(sock.user?.id || '');
}

module.exports = { getSender, getBotJid, normalizeJid, extractNum, num: extractNum };
