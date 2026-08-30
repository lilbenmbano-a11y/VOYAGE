const { reply } = require('./_helper');
const truths = ['What is your biggest fear?','Have you ever lied to your best friend?','What is your most embarrassing moment?','Who do you have a crush on?'];
const dares  = ['Send a voice note singing your favourite song','Change your profile photo to a funny face for 1 hour','Text your crush right now','Do 20 push-ups and send a video'];
module.exports = async (sock, chatId, message) => {
    const isTruth = Math.random() > 0.5;
    const list = isTruth ? truths : dares;
    const choice = list[Math.floor(Math.random()*list.length)];
    await reply(sock, chatId, `${isTruth?'🤍 *TRUTH*':'🔥 *DARE*'}\n━━━━━━━━━━━━\n${choice}`, message);
};
