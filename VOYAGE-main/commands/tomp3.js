const { downloadContentFromMessage } = require('@crysnovax/baileys');
const { reply } = require('./_helper');
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
module.exports = async (sock, chatId, message) => {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const msg = quoted || message.message;
        const vidMsg = msg?.videoMessage || msg?.audioMessage;
        if (!vidMsg) return reply(sock, chatId, '❌ Reply to a video/audio with .tomp3', message);
        await reply(sock, chatId, '🎵 Converting to MP3...', message);
        const type = msg?.videoMessage ? 'video' : 'audio';
        const stream = await downloadContentFromMessage(vidMsg, type);
        const chunks = []; for await (const c of stream) chunks.push(c);
        const tmpIn  = path.join('./temp', `tomp3_in_${Date.now()}.${type==='video'?'mp4':'ogg'}`);
        const tmpOut = path.join('./temp', `tomp3_out_${Date.now()}.mp3`);
        fs.writeFileSync(tmpIn, Buffer.concat(chunks));
        execSync(`ffmpeg -i "${tmpIn}" -vn -acodec mp3 -q:a 2 "${tmpOut}" -y`);
        await sock.sendMessage(chatId, { audio: fs.readFileSync(tmpOut), mimetype: 'audio/mpeg', fileName: 'audio.mp3' }, { quoted: message });
        try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); } catch {}
    } catch { await reply(sock, chatId, '❌ Conversion failed. Make sure ffmpeg is installed.', message); }
};
