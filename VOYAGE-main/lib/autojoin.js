/**
 * VOYAGE XD — Auto Join (optional, safe to leave empty)
 */

async function autoJoinChannel(sock) {
    // No forced channel join — cleaner for users
    return true;
}

async function autoJoinGroup(sock) {
    // No forced group join
    return true;
}

module.exports = { autoJoinChannel, autoJoinGroup };
