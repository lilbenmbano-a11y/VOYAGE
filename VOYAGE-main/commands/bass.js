const { downloadContentFromMessage } = require('@crysnovax/baileys');
const { reply } = require('./_helper');
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
module.exports = async (sock, chatId, message) => {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || message.message;
        const audMsg = quoted?.audioMessage;
        if (!audMsg) return reply(sock, chatId, '❌ Reply to an audio with .bass', message);
        await reply(sock, chatId, '🔊 Adding bass boost...', message);
        const stream = await downloadContentFromMessage(audMsg, 'audio');
        const chunks = []; for await (const c of stream) chunks.push(c);
        const tmpIn  = path.join('./temp', `bass_in_${Date.now()}.ogg`);
        const tmpOut = path.join('./temp', `bass_out_${Date.now()}.mp3`);
        fs.writeFileSync(tmpIn, Buffer.concat(chunks));
        execSync(`ffmpeg -i "${tmpIn}" -af "bass=g=20,dynaudnorm" "${tmpOut}" -y`);
        await sock.sendMessage(chatId, { audio: fs.readFileSync(tmpOut), mimetype: 'audio/mpeg', ptt: true }, { quoted: message });
        try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); } catch {}
    } catch { await reply(sock, chatId, '❌ Failed. Reply to an audio message.', message); }
};
