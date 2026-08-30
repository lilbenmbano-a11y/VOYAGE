/**
 * OCR — Extract text from an image
 * Usage: .ocr (reply/send an image)
 */
const { downloadContentFromMessage } = require('@crysnovax/baileys');
const axios  = require('axios');
const fs     = require('fs');
const path   = require('path');
const { reply } = require('./_helper');

module.exports = async (sock, chatId, message) => {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const msg    = quoted || message.message;
    const imgMsg = msg?.imageMessage;
    if (!imgMsg) return reply(sock, chatId, '❌ Send or reply to an image with .ocr', message);

    await reply(sock, chatId, '🔍 Reading text from image...', message);

    try {
        const stream = await downloadContentFromMessage(imgMsg, 'image');
        const chunks = []; for await (const c of stream) chunks.push(c);
        const b64    = Buffer.concat(chunks).toString('base64');

        // OCR.space free API
        const FormData = require('form-data');
        const form     = new FormData();
        form.append('base64Image', `data:image/jpeg;base64,${b64}`);
        form.append('language', 'eng');
        form.append('isOverlayRequired', 'false');

        const res  = await axios.post('https://api.ocr.space/parse/image', form, {
            headers: { ...form.getHeaders(), apikey: 'helloworld' },
            timeout: 30000,
        });

        const text = res.data?.ParsedResults?.[0]?.ParsedText?.trim();
        if (!text) return reply(sock, chatId, '❌ No text found in image.', message);

        await sock.sendMessage(chatId, {
            text: `📝 *Text extracted from image:*\n\n${text}\n\n_VOYAGE XD©_`,
        }, { quoted: message });

    } catch {
        await reply(sock, chatId, '❌ OCR failed. Try a clearer image.', message);
    }
};
