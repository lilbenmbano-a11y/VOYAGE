const { reply, getSender } = require('./_helper');
const amounts = [1,2,5,10,20,50,100,200,500,1000];
const statuses = ['✅ Sent', '❌ Declined', '⏳ Pending', '🔄 Processing', '💸 Transferred'];
module.exports = async (sock, chatId, message, args) => {
    const target = args[0] || 'someone';
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    await reply(sock, chatId,
`💵 *Cash App Transaction*
━━━━━━━━━━━━━━━━━
👤 *To:* ${target}
💰 *Amount:* $${amount}.00
📊 *Status:* ${status}
🕒 *Time:* ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━
😂 _This is just for fun! Not real!_`, message);
};
