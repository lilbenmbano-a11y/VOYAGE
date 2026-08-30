const fs = require('fs');
const FILE = './data/store.json';
const MAX  = 20;
let store  = { messages: {}, contacts: {}, chats: {} };
function readFromFile() {
    try {
        if (fs.existsSync(FILE)) {
            const d = JSON.parse(fs.readFileSync(FILE,'utf8'));
            store.contacts = d.contacts||{}; store.chats = d.chats||{};
        }
    } catch { store = { messages:{}, contacts:{}, chats:{} }; }
}
function writeToFile() {
    try { fs.writeFileSync(FILE, JSON.stringify({contacts:store.contacts,chats:store.chats},null,2)); } catch {}
}
function bind(ev) {
    ev.on('chats.set',({chats})=>{ chats.forEach(c=>{store.chats[c.id]=c;}); });
    ev.on('contacts.update',updates=>{ updates.forEach(c=>{if(c.id)store.contacts[c.id]={...store.contacts[c.id],...c};}); });
    ev.on('messages.upsert',({messages})=>{
        messages.forEach(msg=>{
            const jid=msg.key?.remoteJid; if(!jid)return;
            if(!store.messages[jid])store.messages[jid]=[];
            store.messages[jid].push(msg);
            if(store.messages[jid].length>MAX)store.messages[jid]=store.messages[jid].slice(-MAX);
        });
    });
}
async function loadMessage(jid,id){ return (store.messages[jid]||[]).find(m=>m.key?.id===id)||null; }
module.exports = {
    readFromFile, writeToFile, bind, loadMessage,
    get contacts(){return store.contacts;}, get chats(){return store.chats;}, get messages(){return store.messages;}
};
