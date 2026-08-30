/**
 * Show server IP address (owner only)
 * Usage: .myip
 */
const { reply, getIsOwner, getSender } = require('./_helper');
const http = require('http');

module.exports = async (sock, chatId, message) => {
    const sender  = getSender(sock, message);
    const isOwner = getIsOwner(sock);
    if (!await isOwner(sender, sock, chatId))
        return reply(sock, chatId, '❌ Owner only command.', message);

    try {
        const ip = await new Promise((res, rej) => {
            http.get({ host: 'api.ipify.org', port: 80, path: '/' }, (resp) => {
                let data = '';
                resp.on('data', chunk => data += chunk);
                resp.on('end', () => res(data));
            }).on('error', rej);
        });
        await reply(sock, chatId, `🌐 *Server IP Address:*\n\`${ip}\``, message);
    } catch {
        await reply(sock, chatId, '❌ Could not fetch IP.', message);
    }
};
