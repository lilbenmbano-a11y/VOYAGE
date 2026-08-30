/**
 * Anime Image Commands — extended gallery
 */
const fetch  = require('node-fetch');
const { reply } = require('./_helper');

const DGXEON = {
    naruto:'naruto',sasuke:'sasuke',itachi:'itachi',nezuko:'nezuko',miku:'miku',
    boruto:'boruto',erza:'erza',mikasa:'mikasa',madara:'madara',pokemon:'pokemon',
    onepiece:'onepiece',hacker:'hekel',art:'art',space:'space',hinata:'hinata',
    kakashi:'kakasih',emilia:'emilia',elaina:'elaina',akira:'akira',akiyama:'akiyama',
    ana:'ana',ayuzawa:'ayuzawa',bts:'bts',chitoge:'chitoge',cyber:'cyber',exo:'exo',
    glasses:'glasses',gremory:'gremory',hestia:'hestia',husbu:'husbu',inori:'inori',
    islamic:'islamic',japanese:'japanese',kpop:'kpop',korean:'korean',
    mountain:'mountain',rize:'rize',satanic:'satanic',technology:'technology',
    fox:'fox',gifs:'gifs',amv:'amv',randomnime:'randomnime',randomnime2:'randomnime2',
    cartoon:'cartoon',hijab:'hijab',
};

const NEKOSBEST_IMG = ['neko','kitsune','husbando','waifu'];
const WAIFUPICS     = ['shinobu','megumin'];

async function animeImg(sock, chatId, message, cmd) {
    // resolve anime* prefix aliases
    const base = cmd.startsWith('anime') && cmd !== 'anime'
        ? cmd.replace(/^anime/, '').toLowerCase() : cmd;

    // special: animewaifu→waifu, animeneko→neko, animemegumin→megumin etc
    const resolved = DGXEON[base] ? base
        : NEKOSBEST_IMG.includes(base) ? base
        : WAIFUPICS.includes(base) ? base
        : DGXEON[cmd] ? cmd : cmd;

    try {
        let imageUrl = null;

        if (DGXEON[resolved]) {
            const res  = await fetch(
                `https://raw.githubusercontent.com/DGXeon/XeonMedia/master/${DGXEON[resolved]}.json`,
                { timeout: 10000 }
            );
            const list = await res.json();
            const arr  = Array.isArray(list) ? list : Object.values(list);
            imageUrl   = arr[Math.floor(Math.random() * arr.length)];
            if (typeof imageUrl === 'object') imageUrl = imageUrl.url || imageUrl.img || null;

        } else if (NEKOSBEST_IMG.includes(resolved)) {
            const res  = await fetch(`https://nekos.best/api/v2/${resolved}`, { timeout: 10000 });
            const data = await res.json();
            imageUrl   = data?.results?.[0]?.url;

        } else if (WAIFUPICS.includes(resolved)) {
            const res  = await fetch(`https://api.waifu.pics/sfw/${resolved}`, { timeout: 10000 });
            const data = await res.json();
            imageUrl   = data?.url;

        } else {
            // try waifu.pics with the cmd name as fallback
            const res  = await fetch(`https://api.waifu.pics/sfw/${resolved}`, { timeout: 10000 });
            const data = await res.json();
            imageUrl   = data?.url;
        }

        if (!imageUrl) throw new Error('No image');

        const label = resolved.charAt(0).toUpperCase() + resolved.slice(1);
        await sock.sendMessage(chatId, {
            image:   { url: imageUrl },
            caption: `✨ *${label}*\n\n_VOYAGE XD©_`,
        }, { quoted: message });

    } catch {
        await reply(sock, chatId, `❌ Could not fetch ${cmd} image.`, message);
    }
}

// All valid image command names including anime* aliases
const IMG_CMDS = [
    ...NEKOSBEST_IMG, ...WAIFUPICS, ...Object.keys(DGXEON),
    // anime* prefixed versions
    'animeneko','animewaifu','animemegumin','animeshinobu','animeavatar',
    'animewallpaper','animewallpaper2','animewall','animewall2',
    'animefoxgirl','animegecg','animewlp','animevideo','animedl',
];

module.exports = { animeImg, IMG_CMDS };
