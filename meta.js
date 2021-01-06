const axios = require("axios");

async function getMeta(metaId) {
  try {
    const { data: meta } = await axios.get(
      `https://appanimeplus.tk/api-animesbr-10.php?info=${metaId}`
    );

    return meta[0];
  } catch (error) {
    console.error(
      `The MovieDB id retrieval failed with http status ${error.response.status}`
    );
  }
}

module.exports = { getMeta };
