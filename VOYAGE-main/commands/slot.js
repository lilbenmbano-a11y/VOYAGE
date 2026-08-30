/**
 * Slot Machine Game — No currency system, just fun
 * Usage: .slot
 */
const { reply } = require('./_helper');

const SYMBOLS = ['🍒', '🍋', '🍊', '🔔', '💎', '7️⃣', '🍀', '⭐'];
const rand = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

module.exports = async (sock, chatId, message) => {
    // Spinning animation message
    const spinning = await sock.sendMessage(chatId, {
        text: `🎰 *SLOT MACHINE*\n\n` +
              `╔═════════════╗\n` +
              `║ ⬛ │ ⬛ │ ⬛ ║\n` +
              `║ ⬛ │ ⬛ │ ⬛ ║ ◀\n` +
              `║ ⬛ │ ⬛ │ ⬛ ║\n` +
              `╚═════════════╝\n\n` +
              `⏳ _Spinning..._`,
    }, { quoted: message });

    // Build final 3x3 grid
    const grid = Array.from({ length: 9 }, rand);

    // Animated spin frames
    for (let i = 0; i < 3; i++) {
        await new Promise(r => setTimeout(r, 1200));
        const g = Array.from({ length: 9 }, rand);
        await sock.sendMessage(chatId, {
            text: `🎰 *SLOT MACHINE*\n\n` +
                  `╔═════════════╗\n` +
                  `║ ${g[0]} │ ${g[1]} │ ${g[2]} ║\n` +
                  `║ ${g[3]} │ ${g[4]} │ ${g[5]} ║ ◀\n` +
                  `║ ${g[6]} │ ${g[7]} │ ${g[8]} ║\n` +
                  `╚═════════════╝\n\n` +
                  `⏳ _Spinning..._`,
            edit: spinning.key,
        });
    }

    await new Promise(r => setTimeout(r, 1200));

    // Determine result
    const row   = [grid[3], grid[4], grid[5]]; // middle row is the win line
    const allNine = grid.every(s => s === grid[0]);
    const midRow  = row[0] === row[1] && row[1] === row[2];
    const topRow  = grid[0] === grid[1] && grid[1] === grid[2];
    const botRow  = grid[6] === grid[7] && grid[7] === grid[8];
    const diagL   = grid[0] === grid[4] && grid[4] === grid[8];
    const diagR   = grid[2] === grid[4] && grid[4] === grid[6];

    let result, stars;
    if (allNine)                      { result = '💎 MEGA JACKPOT!';  stars = '⭐⭐⭐⭐⭐'; }
    else if (midRow && row[0]==='7️⃣') { result = '🎉 JACKPOT!';       stars = '⭐⭐⭐⭐'; }
    else if (midRow)                  { result = '🏆 You Win!';        stars = '⭐⭐⭐'; }
    else if (topRow || botRow)        { result = '🥈 Close!';          stars = '⭐⭐'; }
    else if (diagL || diagR)          { result = '🥉 Diagonal Win!';   stars = '⭐⭐'; }
    else                              { result = '💔 No Match';        stars = '🌑🌑🌑'; }

    await sock.sendMessage(chatId, {
        text: `🎰 *SLOT MACHINE*\n\n` +
              `╔═════════════╗\n` +
              `║ ${grid[0]} │ ${grid[1]} │ ${grid[2]} ║\n` +
              `║ ${grid[3]} │ ${grid[4]} │ ${grid[5]} ║ ◀ WIN LINE\n` +
              `║ ${grid[6]} │ ${grid[7]} │ ${grid[8]} ║\n` +
              `╚═════════════╝\n\n` +
              `${stars}\n*${result}*\n\n_VOYAGE XD©_`,
        edit: spinning.key,
    });
};
