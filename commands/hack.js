const { reply, getSender } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    const target = args[0] ? `@${args[0].replace('@','').replace(/\D/g,'')}` : 'the target';
    const steps = [
        `🔐 Initiating hack on ${target}...`,
        `⚙️ Bypassing firewall... [████░░░░] 40%`,
        `💾 Accessing database... [███████░] 75%`,
        `🌐 Cracking password... [████████] 99%`,
        `✅ Hack complete!\n\n🔓 Password: *ilovevoyage-xd*\n📧 Email: *gotplayed@voyage xd.bot*\n\n😂 *You just got trolled by VOYAGE XD!*`
    ];
    let msg = await sock.sendMessage(chatId, { text: steps[0] }, { quoted: message });
    for (let i = 1; i < steps.length; i++) {
        await new Promise(r => setTimeout(r, 1500));
        await sock.sendMessage(chatId, { text: steps[i] }, { quoted: message });
    }
};
