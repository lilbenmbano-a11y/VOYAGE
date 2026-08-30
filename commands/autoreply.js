const fs = require('fs');
const { reply, getSender, getIsOwner } = require('./_helper');
const FILE = './data/autoreply.json';
function get() { try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {enabled:false,rules:{}}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d,null,2)); }
async function autoReplyCommand(sock, chatId, message, args) {
    const sender = getSender(sock, message);
    const isOwner = getIsOwner(sock);
    if (!await isOwner(sender, sock, chatId)) return reply(sock, chatId, '❌ Owner only.', message);
    const d=get(), sub=args[0]?.toLowerCase();
    if (!sub) return reply(sock, chatId, `🤖 *Auto-Reply*\nStatus: ${d.enabled?'✅ ON':'❌ OFF'}\n\n.autoreply on\n.autoreply off\n.autoreply set <trigger> | <response>`, message);
    if (sub==='on'){d.enabled=true;save(d);return reply(sock,chatId,'✅ Auto-reply enabled!',message);}
    if (sub==='off'){d.enabled=false;save(d);return reply(sock,chatId,'❌ Auto-reply disabled.',message);}
    if (sub==='set'){
        const rest=args.slice(1).join(' '); const parts=rest.split('|').map(s=>s.trim());
        if(parts.length<2)return reply(sock,chatId,'❌ Usage: .autoreply set <trigger> | <response>',message);
        if(!d.rules)d.rules={}; d.rules[parts[0].toLowerCase()]=parts[1]; save(d);
        return reply(sock,chatId,`✅ Set!\n*Trigger:* ${parts[0]}\n*Response:* ${parts[1]}`,message);
    }
}
async function handleAutoReply(sock, message) {
    try {
        const d=get(); if(!d.enabled||!d.rules)return;
        const text=(message.message?.conversation||message.message?.extendedTextMessage?.text||'').toLowerCase().trim();
        const response=d.rules[text]; if(!response)return;
        await sock.sendMessage(message.key.remoteJid,{text:response},{quoted:message});
    } catch {}
}
module.exports = { autoReplyCommand, handleAutoReply };
