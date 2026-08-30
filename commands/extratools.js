/**
 * Extra utility commands:
 * .speedtest — server internet speed
 * .getpp / .getbio — profile info (in getprofile.js)
 * .stickersearch <query> <count> — Telegram sticker search
 * .stickerpack <name> — find sticker packs
 * .shortquote — short motivational quote
 * .lifefact — random life fact
 * .funfacthidup — fun life fact
 * .xquote — hacker/programmer quote
 * .quoteshacker — hacker quote
 * .backup — backup group members list
 * .autostickergc — alias for autosticker
 */
const axios  = require('axios');
const fetch  = require('node-fetch');
const { reply, checkAdmin, getSender } = require('./_helper');

async function speedtestCmd(sock, chatId, message) {
    await reply(sock, chatId, '⚡ Testing server speed...', message);
    const start = Date.now();
    try {
        await axios.get('https://speed.cloudflare.com/__down?bytes=1000000', { timeout: 30000, responseType: 'arraybuffer' });
        const elapsed = (Date.now() - start) / 1000;
        const mbps    = ((1000000 * 8) / elapsed / 1000000).toFixed(2);
        await reply(sock, chatId,
            `⚡ *Speed Test Results*\n\n` +
            `📥 Download: *${mbps} Mbps*\n` +
            `⏱️ Time: ${elapsed.toFixed(2)}s\n` +
            `📊 Data: 1 MB test file\n\n_VOYAGE XD©_`, message);
    } catch {
        await reply(sock, chatId, '❌ Speed test failed.', message);
    }
}

async function stickersearchCmd(sock, chatId, message, args) {
    const parts = args;
    const last  = parts[parts.length - 1];
    let count   = parseInt(last);
    let query;
    if (!isNaN(count) && count > 0) { parts.pop(); query = parts.join(' ').trim(); }
    else { count = 5; query = parts.join(' ').trim(); }
    if (!query) return reply(sock, chatId, '❌ Usage: .stickersearch <query> [count]\nExample: .stickersearch cats 10', message);
    if (count > 20) count = 20;

    await reply(sock, chatId, `🔍 Searching Telegram stickers: *${query}*...`, message);
    try {
        const res  = await axios.post('https://api.fstik.app/searchStickerSet',
            { query, user_token: null },
            { headers: { 'content-type': 'application/json', 'origin': 'https://webapp.fstik.app', 'user-agent': 'NB Android/1.0.0' }, timeout: 10000 }
        );
        const sets = res.data?.result?.stickerSets;
        if (!sets?.length) return reply(sock, chatId, '❌ No sticker packs found.', message);

        const set      = sets[0];
        const stickers = set.stickers?.slice(0, count) || [];
        await reply(sock, chatId, `📦 *${set.title}* — ${stickers.length} stickers\nSending...`, message);

        for (const s of stickers) {
            const url = s.thumb?.file_id
                ? `https://api.fstik.app/file/${s.thumb.file_id}/sticker.webp` : null;
            if (!url) continue;
            try {
                await sock.sendMessage(chatId, { sticker: { url } }, { quoted: message });
                await new Promise(r => setTimeout(r, 300));
            } catch {}
        }
    } catch {
        await reply(sock, chatId, '❌ Sticker search failed.', message);
    }
}

async function shortquoteCmd(sock, chatId, message) {
    const quotes = [
        "Do it now. Sometimes 'later' becomes 'never'.",
        "Dream big, start small, act now.",
        "Discipline is the bridge between goals and achievement.",
        "Be yourself; everyone else is already taken.",
        "You miss 100% of the shots you don't take.",
        "The secret of getting ahead is getting started.",
        "It always seems impossible until it's done.",
        "Success is the sum of small efforts repeated daily.",
        "Work hard in silence; let success make the noise.",
        "Don't count the days, make the days count.",
        "Strive for progress, not perfection.",
        "The harder you work, the luckier you get.",
    ];
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    await sock.sendMessage(chatId, { text: `💬 _"${q}"_\n\n_VOYAGE XD©_` }, { quoted: message });
}

async function lifefactCmd(sock, chatId, message) {
    const facts = [
        "Humans shed about 600,000 skin cells every hour.",
        "Your brain uses about 20% of your body's total energy.",
        "Laughing lowers stress hormones and strengthens the immune system.",
        "The average person walks about 100,000 miles in their lifetime.",
        "Deep breathing activates the parasympathetic nervous system, reducing stress.",
        "You spend about 1/3 of your life asleep — that's roughly 25 years.",
        "The human heart beats over 100,000 times per day.",
        "Staying hydrated can improve your mood and cognitive performance.",
        "Reading fiction can increase empathy by simulating social experiences.",
        "Exercise is one of the most effective treatments for depression.",
    ];
    const f = facts[Math.floor(Math.random() * facts.length)];
    await sock.sendMessage(chatId, { text: `🧠 *Life Fact*\n\n${f}\n\n_VOYAGE XD©_` }, { quoted: message });
}

async function hackerquoteCmd(sock, chatId, message) {
    const quotes = [
        "Security through obscurity is not security at all.",
        "The best defense is understanding how an attack works.",
        "Hackers don't break systems, they break assumptions.",
        "The quieter you become, the more you can hear.",
        "Don't trust — verify.",
        "Privacy is not something that I'm merely entitled to, it's an absolute prerequisite.",
        "The internet is a dangerous place. Know where you walk.",
        "A computer lets you make more mistakes faster than any other invention.",
        "With great power comes great responsibility.",
        "The first step in fixing a broken program is knowing it's broken.",
    ];
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    await sock.sendMessage(chatId, { text: `💻 *Hacker Quote*\n\n_"${q}"_\n\n_VOYAGE XD©_` }, { quoted: message });
}

async function backupCmd(sock, chatId, message) {
    if (!chatId.endsWith('@g.us'))
        return reply(sock, chatId, '❌ Group only.', message);
    if (!await checkAdmin(sock, chatId, message))
        return reply(sock, chatId, '❌ Admins only.', message);

    try {
        const meta    = await sock.groupMetadata(chatId);
        const members = meta.participants.map(p => p.id.replace('@s.whatsapp.net', ''));
        let text = `📋 *Group Backup*\n📌 ${meta.subject}\n👥 Members: ${members.length}\n\n`;
        members.forEach((m, i) => { text += `${i + 1}. +${m}\n`; });
        text += `\n_VOYAGE XD©_`;
        const sender = getSender(sock, message);
        await sock.sendMessage(sender, { text }, { quoted: message });
        await reply(sock, chatId, '✅ Backup sent to your DM!', message);
    } catch {
        await reply(sock, chatId, '❌ Backup failed.', message);
    }
}

module.exports = { speedtestCmd, stickersearchCmd, shortquoteCmd, lifefactCmd, hackerquoteCmd, backupCmd };
