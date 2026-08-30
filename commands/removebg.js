/**
 * Remove Background from image
 * Usage: .removebg (reply/send an image)
 */
const { downloadContentFromMessage } = require('@crysnovax/baileys');
const axios  = require('axios');
const fs     = require('fs');
const path   = require('path');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message) => {
    const quoted  = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const msg     = quoted || message.message;
    const imgMsg  = msg?.imageMessage;
    if (!imgMsg) return reply(sock, chatId, '❌ Send or reply to an image with .removebg', message);

    await reply(sock, chatId, '⏳ Removing background...', message);

    try {
        const stream = await downloadContentFromMessage(imgMsg, 'image');
        const chunks = []; for await (const c of stream) chunks.push(c);
        const buf    = Buffer.concat(chunks);

        const tmpIn  = path.join('./temp', `rbg_in_${Date.now()}.jpg`);
        const tmpOut = path.join('./temp', `rbg_out_${Date.now()}.png`);
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp', { recursive: true });
        fs.writeFileSync(tmpIn, buf);

        const FormData = require('form-data');
        const form     = new FormData();
        form.append('size', 'auto');
        form.append('image_file', fs.createReadStream(tmpIn), { filename: 'image.jpg', contentType: 'image/jpeg' });

        const res = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
            headers: { ...form.getHeaders(), 'X-Api-Key': 'REPLACE_WITH_REMOVEBG_KEY' },
            responseType: 'arraybuffer',
            timeout: 30000,
        });

        const outBuf = Buffer.from(res.data);
        fs.writeFileSync(tmpOut, outBuf);

        await sock.sendMessage(chatId, { image: outBuf, caption: '✅ Background removed!\n\n_VOYAGE XD©_' }, { quoted: message });
        try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); } catch {}

    } catch (e) {
        // Fallback: use free API
        try {
            const stream = await downloadContentFromMessage(imgMsg, 'image');
            const chunks = []; for await (const c of stream) chunks.push(c);
            const b64    = Buffer.concat(chunks).toString('base64');

            const res = await axios.post('https://api.slazzer.com/v2.0/remove_image_background', {
                source_image_type: 'jpg',
                source_image_file: b64,
            }, {
                headers: { 'API-KEY': 'REPLACE_WITH_SLAZZER_KEY', 'Content-Type': 'application/json' },
                responseType: 'arraybuffer',
                timeout: 30000,
            });

            await sock.sendMessage(chatId, { image: Buffer.from(res.data), caption: '✅ Background removed!\n\n_VOYAGE XD©_' }, { quoted: message });
        } catch {
            await reply(sock, chatId, '❌ Failed to remove background. Make sure you have set a valid remove.bg API key in commands/removebg.js', message);
        }
    }
};
