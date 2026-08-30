/**
 * Auto Sticker — converts all images sent to the group into stickers
 * .autosticker on / .autosticker off
 */
const fs   = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@crysnovax/baileys');
const { execSync } = require('child_process');
const { checkAdmin, reply } = require('./_helper');

const DB = path.join('./data', 'autosticker.json');
function load() { try { return JSON.parse(fs.readFileSync(DB)); } catch { return []; } }
function save(d) { if (!fs.existsSync('./data')) fs.mkdirSync('./data',{recursive:true}); fs.writeFileSync(DB, JSON.stringify(d)); }

async function autostickerCommand(sock, chatId, message, args) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Group only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);

    const db  = load();
    const idx = db.indexOf(chatId);

    if ((args[0]||'').toLowerCase() === 'on') {
        if (idx >= 0) return reply(sock, chatId, '✅ Auto Sticker is already ON.', message);
        db.push(chatId); save(db);
        return reply(sock, chatId, '✅ *Auto Sticker ON* — all images will be converted to stickers.', message);
    } else if ((args[0]||'').toLowerCase() === 'off') {
        if (idx < 0) return reply(sock, chatId, '❌ Auto Sticker is already OFF.', message);
        db.splice(idx, 1); save(db);
        return reply(sock, chatId, '❌ *Auto Sticker OFF*.', message);
    } else {
        const status = idx >= 0 ? '✅ ON' : '❌ OFF';
        return reply(sock, chatId, `🖼️ *Auto Sticker* — Status: ${status}\n\nUsage:\n.autosticker on\n.autosticker off`, message);
    }
}

async function handleAutoSticker(sock, chatId, message) {
    const db = load();
    if (!db.includes(chatId)) return;

    const msg    = message.message;
    const imgMsg = msg?.imageMessage;
    if (!imgMsg) return;

    try {
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp', { recursive: true });
        const stream = await downloadContentFromMessage(imgMsg, 'image');
        const chunks = []; for await (const c of stream) chunks.push(c);
        const tmpI   = path.join('./temp', `as_${Date.now()}.jpg`);
        const tmpO   = path.join('./temp', `as_${Date.now()}.webp`);
        fs.writeFileSync(tmpI, Buffer.concat(chunks));
        execSync(`ffmpeg -i "${tmpI}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0" "${tmpO}" -y`);
        await sock.sendMessage(chatId, { sticker: fs.readFileSync(tmpO) }, { quoted: message });
        try { fs.unlinkSync(tmpI); fs.unlinkSync(tmpO); } catch {}
    } catch {}
}

module.exports = { autostickerCommand, handleAutoSticker };
