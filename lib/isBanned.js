const fs = require('fs');
const { num } = require('./isOwner');
function isBanned(userId) {
    try {
        if (!fs.existsSync('./data/banned.json')) return false;
        const list = JSON.parse(fs.readFileSync('./data/banned.json', 'utf8'));
        return list.some(b => num(b) === num(userId));
    } catch { return false; }
}
module.exports = { isBanned };
