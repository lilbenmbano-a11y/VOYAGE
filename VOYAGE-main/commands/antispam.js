const fs = require('fs');
const { checkAdmin, reply, getSender, isAdmin, getIsOwner } = require('./_helper');
const FILE='./data/antispam.json'; const spamMap=new Map();
function get(){try{return JSON.parse(fs.readFileSync(FILE,'utf8'));}catch{return {};}}
function save(d){fs.writeFileSync(FILE,JSON.stringify(d,null,2));}
async function antispamCommand(sock,chatId,message,args){
    if(!chatId.endsWith('@g.us'))return reply(sock,chatId,'❌ Groups only.',message);
    if(!await checkAdmin(sock,chatId,message))return reply(sock,chatId,'❌ Admins only.',message);
    const d=get(),sub=args[0]?.toLowerCase();
    if(!sub)return reply(sock,chatId,`*Anti-Spam*\nStatus: ${d[chatId]?.enabled?'✅ ON':'❌ OFF'}\n\n.antispam on\n.antispam off`,message);
    if(sub==='on'){d[chatId]={enabled:true};save(d);return reply(sock,chatId,'✅ Anti-spam enabled!',message);}
    if(sub==='off'){d[chatId]={enabled:false};save(d);return reply(sock,chatId,'❌ Anti-spam disabled.',message);}
}
async function handleSpam(sock,chatId,message,sender){
    if(!chatId.endsWith('@g.us'))return;
    const d=get();if(!d[chatId]?.enabled)return;
    const isOwner=getIsOwner(sock);
    if(await isAdmin(sock,chatId,sender)||await isOwner(sender,sock,chatId))return;
    const key=`${chatId}_${sender}`,now=Date.now();
    if(!spamMap.has(key))spamMap.set(key,{count:1,time:now});
    else{const s=spamMap.get(key);if(now-s.time<5000){s.count++;if(s.count>=5){await sock.sendMessage(chatId,{text:`⚠️ @${sender.split('@')[0]}, slow down! Anti-spam triggered.`,mentions:[sender]});spamMap.delete(key);}}else spamMap.set(key,{count:1,time:now});}
}
module.exports={antispamCommand,handleSpam};
