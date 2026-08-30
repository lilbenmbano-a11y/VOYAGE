const { downloadContentFromMessage } = require('@crysnovax/baileys');
const { reply } = require('./_helper');
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
module.exports = async (sock, chatId, message) => {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || message.message;
        const audMsg = quoted?.audioMessage;
        if (!audMsg) return reply(sock, chatId, '❌ Reply to an audio with .tovideo', message);
        await reply(sock, chatId, '🎬 Converting to video...', message);
        const stream = await downloadContentFromMessage(audMsg, 'audio');
        const chunks = []; for await (const c of stream) chunks.push(c);
        const tmpIn  = path.join('./temp', `tv_in_${Date.now()}.ogg`);
        const tmpOut = path.join('./temp', `tv_out_${Date.now()}.mp4`);
        fs.writeFileSync(tmpIn, Buffer.concat(chunks));
        execSync(`ffmpeg -f lavfi -i color=c=black:s=320x240:r=25 -i "${tmpIn}" -shortest -c:v libx264 -c:a aac "${tmpOut}" -y`);
        await sock.sendMessage(chatId, { video: fs.readFileSync(tmpOut), caption: '✅ Converted!\n\n_VOYAGE XD©_' }, { quoted: message });
        try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); } catch {}
    } catch { await reply(sock, chatId, '❌ Failed.', message); }
};
