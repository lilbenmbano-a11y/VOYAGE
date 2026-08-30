/**
 * Sticker Meme Generator
 * Usage: .stickermeme top text|bottom text (reply to image)
 */
const { downloadContentFromMessage } = require('@crysnovax/baileys');
const axios    = require('axios');
const fs       = require('fs');
const path     = require('path');
const { execSync } = require('child_process');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message, args) => {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const msg    = quoted || message.message;
    const imgMsg = msg?.imageMessage;

    if (!imgMsg) return reply(sock, chatId, '❌ Send/reply to an image with .stickermeme top text|bottom text', message);

    const text = args.join(' ').trim();
    if (!text)  return reply(sock, chatId, '❌ Usage: .stickermeme top text|bottom text\nExample: .stickermeme when you|code works', message);

    const top    = text.split('|')[0]?.trim() || '-';
    const bottom = text.split('|')[1]?.trim() || '-';

    await reply(sock, chatId, '⏳ Creating meme sticker...', message);

    try {
        const stream = await downloadContentFromMessage(imgMsg, 'image');
        const chunks = []; for await (const c of stream) chunks.push(c);
        const buf    = Buffer.concat(chunks);

        // Upload image to catbox
        const FormData = require('form-data');
        const form     = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buf, { filename: 'img.jpg', contentType: 'image/jpeg' });

        const uploadRes = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders(), timeout: 30000,
        });
        const imgUrl = uploadRes.data?.trim();
        if (!imgUrl?.startsWith('https')) throw new Error('Upload failed');

        const memeUrl = `https://api.memegen.link/images/custom/${encodeURIComponent(top)}/${encodeURIComponent(bottom)}.png?background=${encodeURIComponent(imgUrl)}`;

        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp', { recursive: true });
        const tmpIn  = path.join('./temp', `meme_${Date.now()}.png`);
        const tmpOut = path.join('./temp', `meme_${Date.now()}.webp`);

        const imgBuf = await axios.get(memeUrl, { responseType: 'arraybuffer', timeout: 20000 });
        fs.writeFileSync(tmpIn, Buffer.from(imgBuf.data));
        execSync(`ffmpeg -i "${tmpIn}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0" "${tmpOut}" -y`);

        await sock.sendMessage(chatId, { sticker: fs.readFileSync(tmpOut) }, { quoted: message });
        try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); } catch {}
    } catch {
        await reply(sock, chatId, '❌ Meme sticker creation failed. Make sure ffmpeg is installed.', message);
    }
};
