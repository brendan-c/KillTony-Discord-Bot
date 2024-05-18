const fs = require("fs").promises;
const https = require("https");
const {
  addEpisodeNumbersAndYoutubeLink,
  addTimestampedYouTubeLinks,
} = require("./utils");
const path = require("path");

const url = "https://skanks.xyz/kt/shows.json";
const localDataFile = path.join(__dirname, "..", "data", "master.json");

async function fetchData(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let rawData = "";
        res.on("data", (chunk) => {
          rawData += chunk;
        });
        res.on("end", () => resolve(rawData));
      })
      .on("error", (e) => reject(e));
  });
}

async function processData(data) {
  const shows = JSON.parse(data);
  if (!Array.isArray(shows)) throw new Error("Data is not an array");

  const updatedShows = addEpisodeNumbersAndYoutubeLink(shows);
  updatedShows.forEach(addTimestampedYouTubeLinks);
  return JSON.stringify(updatedShows, null, 2);
}

async function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  try {
    await fs.access(dirname);
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log(`Directory ${dirname} does not exist, creating it...`);
      await fs.mkdir(dirname, { recursive: true });
    } else {
      throw e;
    }
  }
}

async function saveDataToFile(filePath, data) {
  await ensureDirectoryExists(filePath);
  await fs.writeFile(filePath, data);
}

async function updateShowsData() {
  try {
    const rawData = await fetchData(url);
    const updatedJson = await processData(rawData);
    await saveDataToFile(localDataFile, updatedJson);
    console.log(
      "Updated master data successfully with episode numbers and YouTube links",
    );
  } catch (error) {
    console.error("Failed to update shows data:", error);
  }
}

updateShowsData();
