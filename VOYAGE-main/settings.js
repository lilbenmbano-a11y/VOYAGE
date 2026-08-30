require('dotenv').config();
module.exports = {
    botName: 'VOYAGE-XD' || 'VOYAGE XD',
    botOwner:           'Voyage XD',
    ownerNumber:        process.env.OWNER_NUMBER || '',
    prefix:             process.env.PREFIX       || '.',
    packname:           process.env.BOT_NAME     || 'VOYAGE XD',
    author:             '\u00a9 Voyage XD',
    version:            '4.1.0',
    commandMode:        'public',
    storeWriteInterval: 10000,
    warnLimit:          3,
    BOT_IMG: process.env.BOT_IMG || 'https://image2url.com/r2/default/images/1775559993680-0002e8ce-ab87-4349-9d60-5af0eb4dfd11.jpg',
    MALVIN_KEY: process.env.MALVIN_KEY || '',
    MALVIN_API: process.env.MALVIN_API || 'https://api.malvin.gleeze.com',
    DAVID_API: process.env.DAVID_API || 'https://apis.davidcyril.name.ng',
    CHANNEL_LINK: process.env.CHANNEL_LINK || 'https://whatsapp.com/channel/0029VaZGBAFLY6UdyPTRHo3Y',
    GROUP_LINK:   process.env.GROUP_LINK   || 'https://chat.whatsapp.com/invite',
};
