const { addonBuilder } = require("stremio-addon-sdk");
const axios = require("axios");
const { getMeta } = require("./meta");
const { getEpisodes } = require("./episodes");
const { getStream } = require("./stream");

const manifest = {
  id: "anime.brasil.addon",
  version: "0.0.1",
  icon: "",
  name: "Anime Brasil",
  description: "Addon for animes in portuguese.",

  // set what type of resources we will return
  resources: ["catalog", "meta", "stream"],

  types: ["series"], // your add-on will be preferred for those content types

  // set catalogs, we'll be making 2 catalogs in this case, 1 for movies and 1 for series
  catalogs: [
    {
      type: "series",
      id: "anime brasil.serie",
      extraSupported: ["search", "genre", "skip"],
      genres: [
        "Aventura",
        "Ação",
        "Comédia",
        "Drama",
        "Dublado",
        "Ecchi",
        "Escolar",
        "Esporte",
        "Fantasia",
        "Filme",
        "Harem",
        "Historico",
        "Jogo",
        "Josei",
        "Magia",
        "Mecha",
        "Militar",
        "Misterio",
        "Ova",
        "Poderes",
        "Psicológico",
        "Romance",
        "Samurai",
        "Sci-fi",
        "Seinen",
        "Shoujo",
        "Shounen",
        "Slice of life",
        "Sobrenatural",
        "Suspense",
        "Terror",
        "Yaoi",
        "Yuri",
      ],
    },
  ],

  // prefix of item IDs (ie: "tt0032138")
  idPrefixes: ["ab:"],
};

const builder = new addonBuilder(manifest);

async function getCatalog() {
  try {
    const { data: meta } = await axios.get(
      "https://appanimeplus.tk/api-animesbr-10.php?populares"
    );

    const catalog = meta.data || [];

    return catalog;
  } catch (error) {
    console.error(
      `The MovieDB catalog retrieval failed with http status ${error.response.status}`
    );
  }
}

let metas;

const perPage = 100;

builder.defineCatalogHandler(async (args) => {
  const skip = parseInt((args.extra.search || {}).skip || 0);
  if (!metas) {
    const resp = await getCatalog();
    metas = resp.map((el) => {
      return {
        id: `ab:${el.id}`,
        name: `${el.category_name}`,
        poster: `https://cdn.appanimeplus.tk/img/${el.category_image}`,
        posterShape: "regular",
        type: "series",
      };
    });

    /// TODO? Sugestão, tente usar essa biblioteca de agendamentos do NodeJS
    /// * https://www.npmjs.com/package/node-schedule
    /// * Ela evita vários erros comuns e é bem famosa no Node, assim fica no padrão

    setTimeout(() => {
      // clear cache every 24h
      metas = false;
    }, 24 * 60 * 60 * 1000);
  }
  return Promise.resolve({
    metas: metas.slice(skip, skip + perPage),
  });
});

builder.defineMetaHandler(async (args) => {
  const [, metaId] = args.id.split(":");

  const {
    category_name,
    category_image,
    category_description,
    category_genres,
    ano,
  } = await getMeta(metaId);

  const resp = await getEpisodes(metaId);

  const episodes = resp.map((el) => {
    return {
      id: args.id + ":" + `${el.video_id}`,
      title: `${el.title}`,
      released: new Date("0000-00-00 00:00 UTC+02"),
    };
  });

  const metaObj = {
    id: args.id,
    type: `series`,
    name: `${category_name}`,
    genres: `[${category_genres}]`,
    poster: `https://cdn.appanimeplus.tk/img/${category_image}`,
    posterShape: "regular",
    description: `${category_description}`,
    releaseInfo: `${ano}`,
    videos: episodes.sort(),
  };

  console.log(metaObj);

  return Promise.resolve({
    meta: metaObj,
  });
});

builder.defineStreamHandler(async (args) => {
  const [, , videoId] = args.id.split(":");
  const { title, location } = await getStream(videoId);

  const streams = [
    {
      id: args.id,
      title: `${title}`,
      type: `series`,
      url: `${location}`,
    },
  ];

  console.log(streams);

  return { streams };
});

module.exports = builder.getInterface();
