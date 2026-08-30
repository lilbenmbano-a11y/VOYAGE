const { downloadContentFromMessage } = require('@crysnovax/baileys');
const { reply } = require('./_helper');
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
module.exports = async (sock, chatId, message, args) => {
    try {
        const vol = parseInt(args[0]) || 2;
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || message.message;
        const vidMsg = quoted?.videoMessage;
        if (!vidMsg) return reply(sock, chatId, '❌ Reply to a video with .volvideo <1-10>', message);
        await reply(sock, chatId, `🎬 Adjusting video volume to ${vol}x...`, message);
        const stream = await downloadContentFromMessage(vidMsg, 'video');
        const chunks = []; for await (const c of stream) chunks.push(c);
        const tmpIn  = path.join('./temp', `vv_in_${Date.now()}.mp4`);
        const tmpOut = path.join('./temp', `vv_out_${Date.now()}.mp4`);
        fs.writeFileSync(tmpIn, Buffer.concat(chunks));
        execSync(`ffmpeg -i "${tmpIn}" -af "volume=${vol}" -c:v copy "${tmpOut}" -y`);
        await sock.sendMessage(chatId, { video: fs.readFileSync(tmpOut), caption: `✅ Volume: ${vol}x\n\n_TunzyMD©_` }, { quoted: message });
        try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut); } catch {}
    } catch { await reply(sock, chatId, '❌ Failed.', message); }
};
