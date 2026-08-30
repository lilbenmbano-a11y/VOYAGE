const { getMentioned, reply, getSender, isOwner, SIG } = require('./_helper');
const { isAdmin } = require('../lib/isAdmin');
const { getBuffer } = require('../lib/myfunc');
module.exports = async (sock, chatId, message) => {
    try {
        const mentioned=getMentioned(message); const target=mentioned[0]||getSender(sock,message);
        const num=target.split('@')[0]; let status='Hidden',role='User',ppBuf=null;
        try{const s=await sock.fetchStatus(target);if(s?.status)status=s.status;}catch{}
        try{ppBuf=await getBuffer(await sock.profilePictureUrl(target,'image'));}catch{}
        if(chatId.endsWith('@g.us')){const meta=await sock.groupMetadata(chatId);const p=meta.participants.find(x=>x.id.includes(num));if(p?.admin==='superadmin')role='👑 Owner';else if(p?.admin==='admin')role='⭐ Admin';else role='👤 Member';}
        if(isOwner(target))role+=' | 🔑 Bot Owner';
        const text=`👤 *Profile*\n\n📱 +${num}\n🏷️ Role: ${role}\n💬 Status: ${status}`;
        if(ppBuf)await sock.sendMessage(chatId,{image:ppBuf,caption:text+SIG,mentions:[target]},{quoted:message});
        else await sock.sendMessage(chatId,{text:text+SIG,mentions:[target]},{quoted:message});
    } catch { await reply(sock,chatId,'❌ Failed to fetch profile.',message); }
};
