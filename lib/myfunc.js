const axios = require('axios');
async function getBuffer(url) {
    const res = await axios.get(url,{responseType:'arraybuffer',timeout:15000,headers:{'User-Agent':'Mozilla/5.0'}});
    return Buffer.from(res.data);
}
module.exports = { getBuffer };
