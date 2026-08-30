require('dotenv').config();
module.exports = { WARN_COUNT: parseInt(process.env.WARN_COUNT) || 3 };
