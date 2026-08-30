/**
 * Anime Reaction Commands
 * Supports both .hug and .animehug style aliases
 */
const fetch = require('node-fetch');
const { reply } = require('./_helper');

const ACTIONS = {
    hug:      { emoji: '🤗', label: 'gives a warm hug' },
    kiss:     { emoji: '😘', label: 'blows a kiss' },
    pat:      { emoji: '👋', label: 'gives a head pat' },
    slap:     { emoji: '👋', label: 'slaps hard' },
    bite:     { emoji: '😬', label: 'takes a bite' },
    poke:     { emoji: '👉', label: 'pokes' },
    cuddle:   { emoji: '🥰', label: 'cuddles up to' },
    lick:     { emoji: '👅', label: 'licks' },
    bonk:     { emoji: '🔨', label: 'bonks' },
    bully:    { emoji: '😤', label: 'bullies' },
    cry:      { emoji: '😢', label: 'cries' },
    dance:    { emoji: '💃', label: 'dances' },
    feed:     { emoji: '🍱', label: 'feeds' },
    handhold: { emoji: '🤝', label: 'holds hands with' },
    happy:    { emoji: '😄', label: 'is happy' },
    highfive: { emoji: '🙌', label: 'high fives' },
    kill:     { emoji: '💀', label: 'eliminates' },
    smug:     { emoji: '😏', label: 'is smug at' },
    tickle:   { emoji: '😂', label: 'tickles' },
    wave:     { emoji: '👋', label: 'waves at' },
    wink:     { emoji: '😉', label: 'winks at' },
    yeet:     { emoji: '🚀', label: 'yeets' },
    blush:    { emoji: '😊', label: 'blushes at' },
    smile:    { emoji: '😊', label: 'smiles at' },
    punch:    { emoji: '👊', label: 'punches' },
    nom:      { emoji: '😋', label: 'noms' },
    nod:      { emoji: '😌', label: 'nods at' },
    nope:     { emoji: '🙅', label: 'says nope to' },
    spank:    { emoji: '👋', label: 'spanks' },
    glomp:    { emoji: '🤗', label: 'glomps' },
    awoo:     { emoji: '🐺', label: 'awoos at' },
    cringe:   { emoji: '😬', label: 'cringes at' },
};

// Map anime* prefixed commands to base action
const ANIME_ALIASES = {
    animehug: 'hug', animekiss: 'kiss', animepat: 'pat', animeslap: 'slap',
    animebite: 'bite', animepoke: 'poke', animecuddle: 'cuddle', animelick: 'lick',
    animebonk: 'bonk', animebully: 'bully', animecry: 'cry', animedance: 'dance',
    animefeed: 'feed', animehandhold: 'handhold', animehappy: 'happy',
    animehighfive: 'highfive', animekill: 'kill', animesmug: 'smug',
    animetickle: 'tickle', animewave: 'wave', animewink: 'wink', animeyeet: 'yeet',
    animeblush: 'blush', animesmile: 'smile', animenom: 'nom', animespank: 'spank',
    animeglomp: 'glomp', animeawoo: 'awoo', animecringe: 'cringe',
    animewlp: 'wave',
};

async function animeReact(sock, chatId, message, cmd) {
    // Resolve alias
    const action = ANIME_ALIASES[cmd] || cmd;
    const info   = ACTIONS[action];
    if (!info) return;

    const senderNum = message.key.participant || message.key.remoteJid;
    const senderTag = `@${senderNum.split('@')[0]}`;
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const targetNum = mentioned[0] || null;
    const targetTag = targetNum ? `@${targetNum.split('@')[0]}` : 'everyone';

    try {
        const res  = await fetch(`https://nekos.best/api/v2/${action}`, { timeout: 10000 });
        const data = await res.json();
        const item = data?.results?.[0];
        if (!item?.url) throw new Error('No result');

        const caption =
            `${info.emoji} *${senderTag} ${info.label} ${targetTag}*` +
            `\n🎬 _${item.anime_name || 'Anime'}_\n\n_VOYAGE XD©_`;

        await sock.sendMessage(chatId, {
            video: { url: item.url }, gifPlayback: true, caption,
            mentions: [senderNum, ...(targetNum ? [targetNum] : [])],
        }, { quoted: message });
    } catch {
        await reply(sock, chatId, `❌ Failed to fetch ${action} GIF.`, message);
    }
}

module.exports = { animeReact, ACTIONS, ANIME_ALIASES };
