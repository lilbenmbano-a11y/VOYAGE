const { reply } = require('./_helper');
module.exports = async (sock, chatId, message) => {
    await reply(sock, chatId, `🎵 *Shazam*\n━━━━━━━━━━━━\nTo identify a song:\n\n1. Use the Shazam app on your phone\n2. Or try .lyrics <song name> if you know part of it\n3. Or use .ai to describe the song\n\n_Audio recognition requires native device features._`, message);
};
