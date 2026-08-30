const { downloadContentFromMessage } = require('@crysnovax/baileys');
const { reply } = require('./_helper');
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
module.exports = async (sock, chatId, message) => {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || message.message;
        const audMsg = quoted?.audioMessage;
        if (!audMsg) return reply(sock, chatId, '❌ Reply to an audio with .blown', message);
        await reply(sock, chatId, '💨 Applying blown speaker effect...', message);
        const stream = await downloadContentFromMessage(audMsg, 'audio');
        const chunks = []; for await (const c of stream) chunks.push(c);
        const tmpIn  = path.join('./temp', `blown_in_${Date.now()}.ogg`);
        const tmpOut = path.join('./temp', `blown_out_${Date.now()}.mp3`);
        fs.writeFileSync(tmpIn, Buffer.concat(chunks));
        execSync(`ffmpeg -i "${tmpIn}" -af "acrusher=.1:1:64:0:log" "${tmpOut}" -y`);
        await sock.sendMessage(chatId, { audio: fs.readFileSync(tmpOut), mimetype: 'audio/mpeg', ptt: true }, { quoted: message });
        try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); } catch {}
    } catch { await reply(sock, chatId, '❌ Failed.', message); }
};
