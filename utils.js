const Fuse = require("fuse.js");

function shortenURL(url) {
  if (!url) return '';
  let newURL = url.replace("youtube.com/watch?v=", "youtu.be/");
  newURL = newURL.replace("&start=", "&t=");
  newURL = newURL.split("&end")[0];
  return newURL;
}

function searchByName(data, searchType, searchName, targetEpisode = null) {
  let allItems = [];
  for (const episodeNumber in data) {
    if (targetEpisode && episodeNumber !== targetEpisode) {
      continue;
    }

    const episode = data[episodeNumber];
    if (searchType === "performer") {
      episode.performers.forEach((item) => {
        allItems.push({
          episodeNumber,
          episodeUrl: episode.url,
          name: item.name,
          performance: item.performance,
        });
      });
    } else if (searchType === "guest") {
      episode.guests.forEach((name) => {
        allItems.push({
          episodeNumber,
          episodeUrl: episode.url,
          name: name,
        });
      });
    }
  }

  const fuse = new Fuse(allItems, {
    keys: ["name"],
    includeScore: true,
    threshold: 0.3,
  });

  const results = fuse.search(searchName);

  return results.map((result) => result.item);
}

module.exports = {
  shortenURL,
  searchByName,
};
