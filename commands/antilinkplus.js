/**
 * Extended AntiLink — per-platform controls
 * .antilinkall / .antilinktiktok / .antilinkig / .antilinkfacebook /
 * .antilinktwitter / .antilinktelegram / .antilinkytvid / .antilinkytch
 * .antitoxic / .antibot / .antinsfw / .antitagsw / .antipromosi / .antiwork / .antivirus
 */
const fs   = require('fs');
const path = require('path');
const { checkAdmin, reply } = require('./_helper');

const DB_PATH = path.join('./data', 'antilinkplus.json');

function loadDB() {
    try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; }
}
function saveDB(db) {
    if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

const PLATFORMS = {
    antilinkall:            { label: 'All Links',             pattern: /https?:\/\//i },
    antilinktiktok:         { label: 'TikTok',                pattern: /tiktok\.com|vm\.tiktok/i },
    antilinktt:             { label: 'TikTok',                pattern: /tiktok\.com|vm\.tiktok/i },
    antilinkig:             { label: 'Instagram',             pattern: /instagram\.com|instagr\.am/i },
    antilinkinsta:          { label: 'Instagram',             pattern: /instagram\.com|instagr\.am/i },
    antilinkinstagram:      { label: 'Instagram',             pattern: /instagram\.com|instagr\.am/i },
    antilinkfacebook:       { label: 'Facebook',              pattern: /facebook\.com|fb\.com|fb\.watch/i },
    antilinkfb:             { label: 'Facebook',              pattern: /facebook\.com|fb\.com|fb\.watch/i },
    antilinktwitter:        { label: 'Twitter/X',             pattern: /twitter\.com|x\.com|t\.co/i },
    antilinktwit:           { label: 'Twitter/X',             pattern: /twitter\.com|x\.com|t\.co/i },
    antilinktwt:            { label: 'Twitter/X',             pattern: /twitter\.com|x\.com|t\.co/i },
    antilinktelegram:       { label: 'Telegram',              pattern: /t\.me|telegram\.me/i },
    antilinktg:             { label: 'Telegram',              pattern: /t\.me|telegram\.me/i },
    antilinkyoutubevid:     { label: 'YouTube Videos',        pattern: /youtu\.be|youtube\.com\/watch/i },
    antilinkytvid:          { label: 'YouTube Videos',        pattern: /youtu\.be|youtube\.com\/watch/i },
    antilinkyoutubevideo:   { label: 'YouTube Videos',        pattern: /youtu\.be|youtube\.com\/watch/i },
    antilinkyoutubech:      { label: 'YouTube Channels',      pattern: /youtube\.com\/@|youtube\.com\/channel/i },
    antilinkytch:           { label: 'YouTube Channels',      pattern: /youtube\.com\/@|youtube\.com\/channel/i },
    antilinkyoutubechannel: { label: 'YouTube Channels',      pattern: /youtube\.com\/@|youtube\.com\/channel/i },
    antilinkgc:             { label: 'WhatsApp Group Links',  pattern: /chat\.whatsapp\.com/i },
    antilinkgc2:            { label: 'WhatsApp Group Links',  pattern: /chat\.whatsapp\.com/i },
    antilinkch:             { label: 'WhatsApp Channels',     pattern: /whatsapp\.com\/channel/i },
    antipromosi:            { label: 'Promo/Spam Links',      pattern: /bit\.ly|tinyurl|shorturl|is\.gd|cutt\.ly/i },
    antitoxic:              { label: 'Toxic Words',           pattern: /\b(fuck|shit|bitch|asshole|idiot|stupid|moron|damn)\b/i },
    antibot:                { label: 'Bot Detection',         pattern: null },
    antinsfw:               { label: 'NSFW Links',            pattern: /xvideos|pornhub|xhamster|redtube|xnxx/i },
    antitagsw:              { label: 'Status Tagging',        pattern: null },
    antiwork:               { label: 'Anti-Work Messages',    pattern: null },
    antivirus:              { label: 'Crash/Virus Messages',  pattern: null },
};

async function handleAntilinkPlus(sock, chatId, message, args, cmd) {
    if (!chatId.endsWith('@g.us'))
        return reply(sock, chatId, '❌ Group only command.', message);
    if (!await checkAdmin(sock, chatId, message))
        return reply(sock, chatId, '❌ Admins only.', message);

    const plat  = PLATFORMS[cmd];
    if (!plat)  return reply(sock, chatId, '❌ Unknown antilink command.', message);

    const db    = loadDB();
    if (!db[chatId]) db[chatId] = {};

    const mode  = (args[0] || '').toLowerCase();
    const label = plat.label;

    if (mode === 'on') {
        db[chatId][cmd] = true;
        saveDB(db);
        await reply(sock, chatId, `✅ *Anti ${label}* enabled in this group.`, message);
    } else if (mode === 'off') {
        delete db[chatId][cmd];
        saveDB(db);
        await reply(sock, chatId, `❌ *Anti ${label}* disabled.`, message);
    } else {
        const status = db[chatId][cmd] ? '✅ ON' : '❌ OFF';
        await reply(sock, chatId, `🛡️ *Anti ${label}*\nStatus: ${status}\n\nUsage:\n.${cmd} on\n.${cmd} off`, message);
    }
}

async function checkAntilinkPlus(sock, chatId, message, text) {
    if (!chatId.endsWith('@g.us')) return;
    const db = loadDB();
    if (!db[chatId]) return;

    for (const [cmd, plat] of Object.entries(PLATFORMS)) {
        if (!db[chatId][cmd] || !plat.pattern) continue;
        if (plat.pattern.test(text)) {
            try {
                await sock.sendMessage(chatId, { delete: message.key });
                const sender = message.key.participant || message.key.remoteJid;
                await sock.sendMessage(chatId, {
                    text: `⚠️ @${sender.split('@')[0]} — *${plat.label}* links are not allowed here.\n\n_VOYAGE XD©_`,
                    mentions: [sender],
                });
            } catch {}
            return;
        }
    }
}

module.exports = { handleAntilinkPlus, checkAntilinkPlus, PLATFORMS };
