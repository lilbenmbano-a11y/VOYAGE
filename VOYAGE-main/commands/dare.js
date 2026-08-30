const { reply } = require('./_helper');
const D=["Send a voice note singing your favourite song.","Change your profile picture to a silly face for 1 hour.","Text the last person you texted saying 'I love you'.","Do 20 push-ups right now.","Post a status with only emojis for 10 minutes."];
module.exports = async (sock, chatId, message) => { await reply(sock, chatId, `🔥 *Dare*\n\n_${D[Math.floor(Math.random()*D.length)]}_`, message); };
