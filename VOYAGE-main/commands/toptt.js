const { downloadContentFromMessage } = require('@crysnovax/baileys');
const { reply } = require('./_helper');
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
module.exports = async (sock, chatId, message) => {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || message.message;
        const audMsg = quoted?.audioMessage || quoted?.videoMessage;
        if (!audMsg) return reply(sock, chatId, '❌ Reply to an audio/video with .toptt', message);
        const type = quoted?.videoMessage ? 'video' : 'audio';
        const stream = await downloadContentFromMessage(audMsg, type);
        const chunks = []; for await (const c of stream) chunks.push(c);
        const tmpIn  = path.join('./temp', `ptt_in_${Date.now()}`);
        const tmpOut = path.join('./temp', `ptt_out_${Date.now()}.ogg`);
        fs.writeFileSync(tmpIn, Buffer.concat(chunks));
        execSync(`ffmpeg -i "${tmpIn}" -acodec libopus -b:a 24k "${tmpOut}" -y`);
        await sock.sendMessage(chatId, { audio: fs.readFileSync(tmpOut), mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: message });
        try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); } catch {}
    } catch { await reply(sock, chatId, '❌ Failed.', message); }
};
