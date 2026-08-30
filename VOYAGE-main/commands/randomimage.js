/**
 * Random image categories — boy, girl, couple, nature, car, cat, dog, food
 * Usage: .randomboy / .randomgirl / .nature / .car / .cat / .dog / .food
 */
const fetch  = require('node-fetch');
const axios  = require('axios');
const { reply } = require('./_helper');

const UNSPLASH_TOPICS = {
    nature:  'nature',
    car:     'cars',
    food:    'food-drink',
    city:    'architecture',
    space:   'space',
    animals: 'animals',
};

async function sendUnsplash(sock, chatId, message, topic) {
    try {
        const res  = await fetch(`https://source.unsplash.com/random/800x600?${topic}`, { redirect: 'follow', timeout: 15000 });
        await sock.sendMessage(chatId, {
            image:   { url: res.url },
            caption: `🖼️ *Random ${topic.charAt(0).toUpperCase() + topic.slice(1)}*\n📸 via Unsplash\n\n_VOYAGE XD©_`,
        }, { quoted: message });
    } catch {
        await reply(sock, chatId, `❌ Could not fetch ${topic} image.`, message);
    }
}

async function sendWaifuPics(sock, chatId, message, category) {
    try {
        const res  = await fetch(`https://api.waifu.pics/sfw/${category}`, { timeout: 10000 });
        const data = await res.json();
        if (!data?.url) throw new Error('no url');
        await sock.sendMessage(chatId, {
            image:   { url: data.url },
            caption: `✨ *Random ${category}*\n\n_VOYAGE XD©_`,
        }, { quoted: message });
    } catch {
        await reply(sock, chatId, `❌ Could not fetch ${category} image.`, message);
    }
}

async function sendRandomPerson(sock, chatId, message, gender) {
    try {
        const url  = `https://randomuser.me/api/?gender=${gender}&inc=picture,name&nat=us`;
        const { data } = await axios.get(url, { timeout: 10000 });
        const user = data?.results?.[0];
        if (!user) throw new Error('no user');
        await sock.sendMessage(chatId, {
            image:   { url: user.picture.large },
            caption: `👤 *Random ${gender === 'male' ? 'Boy' : 'Girl'}*\n📛 ${user.name.first} ${user.name.last}\n\n_VOYAGE XD©_`,
        }, { quoted: message });
    } catch {
        await reply(sock, chatId, `❌ Could not fetch random ${gender} image.`, message);
    }
}

async function sendCatOrDog(sock, chatId, message, type) {
    try {
        let url;
        if (type === 'cat') {
            const res  = await fetch('https://api.thecatapi.com/v1/images/search', { timeout: 10000 });
            const data = await res.json();
            url = data[0]?.url;
        } else {
            const res  = await fetch('https://dog.ceo/api/breeds/image/random', { timeout: 10000 });
            const data = await res.json();
            url = data?.message;
        }
        if (!url) throw new Error('no url');
        await sock.sendMessage(chatId, {
            image:   { url },
            caption: `${type === 'cat' ? '🐱' : '🐶'} *Random ${type.charAt(0).toUpperCase() + type.slice(1)}*\n\n_VOYAGE XD©_`,
        }, { quoted: message });
    } catch {
        await reply(sock, chatId, `❌ Could not fetch ${type} image.`, message);
    }
}

module.exports = { sendUnsplash, sendWaifuPics, sendRandomPerson, sendCatOrDog, UNSPLASH_TOPICS };
