const { downloadContentFromMessage } = require('@crysnovax/baileys');
const { reply } = require('./_helper');
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
module.exports = async (sock, chatId, message, args) => {
    try {
        const vol = parseInt(args[0]) || 2;
        if (vol < 1 || vol > 10) return reply(sock, chatId, '❌ Volume must be between 1-10\nExample: .volaudio 3', message);
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || message.message;
        const audMsg = quoted?.audioMessage;
        if (!audMsg) return reply(sock, chatId, '❌ Reply to an audio with .volaudio <1-10>', message);
        await reply(sock, chatId, `🔊 Adjusting volume to ${vol}x...`, message);
        const stream = await downloadContentFromMessage(audMsg, 'audio');
        const chunks = []; for await (const c of stream) chunks.push(c);
        const tmpIn  = path.join('./temp', `vol_in_${Date.now()}.ogg`);
        const tmpOut = path.join('./temp', `vol_out_${Date.now()}.mp3`);
        fs.writeFileSync(tmpIn, Buffer.concat(chunks));
        execSync(`ffmpeg -i "${tmpIn}" -af "volume=${vol}" "${tmpOut}" -y`);
        await sock.sendMessage(chatId, { audio: fs.readFileSync(tmpOut), mimetype: 'audio/mpeg', ptt: true }, { quoted: message });
        try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); } catch {}
    } catch { await reply(sock, chatId, '❌ Failed.', message); }
};
