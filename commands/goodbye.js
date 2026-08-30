const fs=require('fs');
const {checkAdmin,reply}=require('./_helper');
const FILE='./data/goodbye.json';
function get(){try{return JSON.parse(fs.readFileSync(FILE,'utf8'));}catch{return {};}}
function save(d){fs.writeFileSync(FILE,JSON.stringify(d,null,2));}
async function goodbyeCommand(sock,chatId,message,args){
    if(!chatId.endsWith('@g.us'))return reply(sock,chatId,'❌ Groups only.',message);
    if(!await checkAdmin(sock,chatId,message))return reply(sock,chatId,'❌ You need to be an admin.',message);
    const d=get(),sub=args[0]?.toLowerCase();
    if(!sub)return reply(sock,chatId,`👋 *Goodbye*\nStatus: ${d[chatId]?.enabled?'✅ ON':'❌ OFF'}\n\n.goodbye on\n.goodbye off\n.goodbye set <msg>`,message);
    if(sub==='on'){d[chatId]={...d[chatId],enabled:true};save(d);return reply(sock,chatId,'✅ Goodbye *enabled!*',message);}
    if(sub==='off'){d[chatId]={...d[chatId],enabled:false};save(d);return reply(sock,chatId,'❌ Goodbye *disabled.*',message);}
    if(sub==='set'){const msg=args.slice(1).join(' ').trim();if(!msg)return reply(sock,chatId,'❌ Usage: .goodbye set <msg>',message);d[chatId]={...d[chatId],msg,enabled:true};save(d);return reply(sock,chatId,'✅ Goodbye message set!',message);}
}
async function handleLeave(sock,gid,participants){
    try{
        const d=get(),c=d[gid];if(!c?.enabled)return;
        for(const p of participants){
            let msg=c.msg||`👋 *@user* has left the group. Goodbye!`;
            msg=msg.replace(/@user/gi,`@${p.split('@')[0]}`);
            await sock.sendMessage(gid,{text:msg+'\n\n_VOYAGE XD©_',mentions:[p]}).catch(()=>{});
        }
    }catch{}
}
module.exports={goodbyeCommand,handleLeave};
