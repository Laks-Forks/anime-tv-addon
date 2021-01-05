const axios = require('axios');

async function getStream(videoId) {
  try {
      var meta = (
          await axios.get(
              `https://appanimeplus.tk/api-animesbr-10.php?episodios=${videoId}`
          )
      ).data;
  } catch (error) {
      console.error(`The MovieDB id retrieval failed with http status ${error.response.status}`);
  }
  return meta[0];
}

module.exports = { getStream };