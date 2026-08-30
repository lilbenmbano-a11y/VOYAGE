/**
 * Al-Quran & Bible lookup
 * .quran <surah> <ayat>  — updated to use open REST API
 * .alkitab <search>
 */
const axios  = require('axios');
const { reply } = require('./_helper');

async function quranCmd(sock, chatId, message, args) {
    const surah = parseInt(args[0]);
    const ayat  = parseInt(args[1]);
    if (!surah || !ayat)
        return reply(sock, chatId, '❌ Usage: .quran <surah number> <ayat number>\nExample: .quran 1 1', message);

    await reply(sock, chatId, '📖 Fetching Quran verse...', message);
    try {
        const { data } = await axios.get(
            `https://api.alquran.cloud/v1/ayah/${surah}:${ayat}/editions/quran-simple,en.asad`,
            { timeout: 10000 }
        );
        const arabic  = data?.data?.[0];
        const english = data?.data?.[1];
        if (!arabic) throw new Error('Not found');

        const text =
            `📖 *Al-Quran*\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📌 *${arabic.surah?.englishName}* (${arabic.surah?.name}) — Ayat ${ayat}\n\n` +
            `*Arabic:*\n${arabic.text}\n\n` +
            `*English (Asad):*\n${english?.text || 'N/A'}\n\n` +
            `_VOYAGE XD©_`;

        await sock.sendMessage(chatId, { text }, { quoted: message });
    } catch {
        await reply(sock, chatId, '❌ Verse not found. Check surah and ayat numbers.', message);
    }
}

async function alkitabCmd(sock, chatId, message, args) {
    const query = args.join(' ').trim();
    if (!query) return reply(sock, chatId, '❌ Usage: .alkitab <search term>\nExample: .alkitab genesis 1', message);

    await reply(sock, chatId, `📖 Searching Bible for: *${query}*...`, message);
    try {
        const { data } = await axios.get(
            `https://bible-api.com/${encodeURIComponent(query)}`,
            { timeout: 10000 }
        );
        if (!data?.text) throw new Error('Not found');

        const text =
            `✝️ *Bible*\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📌 *${data.reference}*\n\n` +
            `${data.text.trim().slice(0, 1000)}\n\n` +
            `_VOYAGE XD©_`;

        await sock.sendMessage(chatId, { text }, { quoted: message });
    } catch {
        await reply(sock, chatId, '❌ Verse not found. Try: .alkitab john 3:16', message);
    }
}

module.exports = { quranCmd, alkitabCmd };
