const Fuse = require("fuse.js");
const path = require("path");

const { readDataFromFile, normalizeText } = require("./utils");

const localDataFile = path.join(__dirname, "..", "data", "master.json");


async function searchByName(name) {
  const shows = await readDataFromFile(localDataFile);
  shows.sort((a, b) => b.e - a.e); // Ensures latest episodes come first

  let allItems = [];

  // Preprocess shows to flatten the data for Fuse.js
  shows.forEach((show) => {
      if (show.g) {
          show.g.forEach((guestName) => {
              allItems.push({
                  ...show,
                  type: "guest",
                  matchedName: guestName,
              });
          });
      }
      if (show.p) {
          show.p.forEach((performer) => {
              allItems.push({
                  ...show,
                  type: "performer",
                  matchedName: performer.n,
              });
          });
      }
  });

  if (name === '') {
      // Return all items if the search name is empty
      let guestResults = allItems.filter(item => item.type === "guest");
      let performerResults = allItems.filter(item => item.type === "performer");
      return { guestResults, performerResults };
  } else {
      // Check if search is for an exact match
      let isExactMatch = name.startsWith('"') && name.endsWith('"');
      let searchQuery = isExactMatch ? name.slice(1, -1) : name; // Remove the quotes

      // Use Fuse.js for non-empty search queries
      const options = {
          includeScore: true,
          keys: ["matchedName"],
          threshold: isExactMatch ? 0.1 : 0.3, // Lower threshold for exact matches
          includeMatches: true,
          isCaseSensitive: false
      };

      const fuse = new Fuse(allItems, options);
      const results = fuse.search(searchQuery);

      let guestResults = results.filter(result => result.item.type === "guest").map(result => result.item);
      let performerResults = results.filter(result => result.item.type === "performer").map(result => result.item);

      return { guestResults, performerResults };
  }
}

async function searchByEpisode(episodeIdentifier) {
  const shows = await readDataFromFile(localDataFile);
  shows.sort((a, b) => b.e - a.e); // Ensures latest episodes come first
  // Handle the 'latest' episode request
  if (episodeIdentifier === "latest") {
    return shows[0]; // Return the first show in the array assuming it's the latest episode
  } else {
    // Parse the episodeIdentifier to integer
    const episodeNumber = parseInt(episodeIdentifier, 10);
    if (!isNaN(episodeNumber)) {
      // Filter the shows to find the one with the matching episode number
      const episode = shows.find(show => show.e === episodeNumber);
      return episode; // Return the found episode or undefined if no match
    } else {
      return undefined; // Return undefined if episodeIdentifier is not a valid number
    }
  }
}

async function searchByVenue(query) {
  const shows = await readDataFromFile(localDataFile);
  shows.sort((a, b) => b.e - a.e); // Ensures latest episodes come first
  const normalizedQuery = normalizeText(query);

  // Specifically handle state code searches
  if (query.length === 2) {
    // Assuming state codes in venue names are formatted like 'TX', 'CA' etc.
    const stateCode = normalizedQuery.toUpperCase();
    return shows.filter(show => show.v.includes(stateCode));
  } else {
    // Use Fuse.js for general venue searches
    const options = {
      keys: ["v"],
      threshold: 0.3,
      includeScore: true,
      isCaseSensitive: false,
    };
    const fuse = new Fuse(shows, options);
    return fuse.search(normalizedQuery).map((result) => result.item);
  }
}

module.exports = {
  searchByEpisode,
  searchByName,
  searchByVenue,
};

