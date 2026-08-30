const { downloadContentFromMessage } = require('@crysnovax/baileys');
const { execSync } = require('child_process');
const settings = require('../settings');
const { reply } = require('./_helper');
const fs = require('fs'), path = require('path');
module.exports = async (sock, chatId, message) => {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const msg = quoted || message.message;
        const imgMsg = msg?.imageMessage;
        const vidMsg = msg?.videoMessage && msg.videoMessage.seconds <= 10 ? msg.videoMessage : null;
        if (!imgMsg && !vidMsg) return reply(sock, chatId, '❌ Send/reply to an image or short video with .sticker', message);
        await sock.sendMessage(chatId, { text: '⏳ Creating sticker...' }, { quoted: message });
        const type = imgMsg ? 'image' : 'video';
        const stream = await downloadContentFromMessage(imgMsg||vidMsg, type);
        const chunks = []; for await (const c of stream) chunks.push(c);
        const tmpI = path.join('./temp',`s_${Date.now()}.${type==='image'?'jpg':'mp4'}`);
        const tmpO = path.join('./temp',`s_${Date.now()}.webp`);
        fs.writeFileSync(tmpI, Buffer.concat(chunks));
        if (type==='image') execSync(`ffmpeg -i "${tmpI}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0" "${tmpO}" -y`);
        else execSync(`ffmpeg -i "${tmpI}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -loop 0 -t 9 -an "${tmpO}" -y`);
        await sock.sendMessage(chatId, { sticker: fs.readFileSync(tmpO), packname: settings.packname, author: settings.author });
        try { fs.unlinkSync(tmpI); fs.unlinkSync(tmpO); } catch {}
    } catch { await reply(sock, chatId, '❌ Sticker failed. Make sure ffmpeg is installed.', message); }
};
