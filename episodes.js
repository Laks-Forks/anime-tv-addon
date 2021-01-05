const axios = require('axios');

async function getEpisodes(metaId) {
  let meta = { data: [] }
  try {
    meta = await axios.get(`https://appanimeplus.tk/api-animesbr-10.php?cat_id=${metaId}`)
  } catch(err) {}
  return meta.data
};

module.exports = { getEpisodes };
