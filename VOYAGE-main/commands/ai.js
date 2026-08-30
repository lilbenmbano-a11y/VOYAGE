const axios = require('axios');
const { reply } = require('./_helper');
module.exports = async (sock, chatId, message, args) => {
    try {
        const q=args.join(' ').trim(); if(!q)return reply(sock,chatId,'❌ Usage: .ai <question>',message);
        await sock.sendMessage(chatId,{text:'🤖 Thinking...'},{ quoted: message });
        const res=await axios.post('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',{inputs:`<s>[INST] ${q} [/INST]`,parameters:{max_new_tokens:250,temperature:0.7,return_full_text:false}},{headers:{'Content-Type':'application/json'},timeout:30000});
        let answer=(Array.isArray(res.data)?res.data[0]?.generated_text:res.data?.generated_text)||'No response.';
        answer=answer.replace(/<\/?s>/g,'').replace(/\[INST\]|\[\/INST\]/g,'').trim();
        await reply(sock,chatId,`🤖 *VOYAGE XD AI*\n\n❓ ${q}\n\n💬 ${answer}`,message);
    } catch { await reply(sock,chatId,'❌ AI unavailable. Try again later.',message); }
};
