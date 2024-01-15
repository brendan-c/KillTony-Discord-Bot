const puppeteer = require("puppeteer");
const fs = require("fs").promises;

const selectors = {
  show: "li.w-full",
  episode: "span.text-sm",
  guests: "span.font-bold",
  performers: "ul.ml-5 li",
  url: "a.w-full",
  child: "ul.ml-5",
  container: "ul.flex-row-reverse",
  venue: "span.text-end",
};

let latestShow;

async function scrape() {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await setupPage(page);

    await navigateToLatestShow(page);

    latestShow = await extractShowDetails(page);

    await updateMissingEpisodes();

    console.log(`Finished scraping episode #${latestShow.latestEpisode}`);
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await browser.close();
  }
}

async function setupPage(page) {
  await setUserAgent(page);
  await page.goto(`https://skanks.xyz/kt/`);
  await delay(200);
}

async function navigateToLatestShow(page) {
  await page.waitForSelector(selectors.container);
  await (await page.$(selectors.url)).click();
  await page.waitForSelector(selectors.child);
}
async function extractShowDetails(page) {
  // Get handles for episode, guests, and venue
  const episodeElementHandle = await page.$(selectors.episode);
  const guestsElementHandle = await page.$(selectors.guests);
  const venueHandle = await page.$(selectors.venue);

  const childHandle = await page.$(selectors.child);
  const parentHandle = await childHandle.evaluateHandle(
    (node) => node.parentElement
  );

  const url = await parentHandle.$eval(selectors.url, (el) => el.href);
  const performers = await extractPerformers(page);

  // Use getTextContent function to get text content of elements
  const latestEpisode = await getTextContent(episodeElementHandle);
  const guests = await getTextContent(guestsElementHandle);
  const venue = await getTextContent(venueHandle);

  return { url, guests, performers, venue, latestEpisode };
}

async function extractPerformers(page) {
  await page.waitForSelector(selectors.performers);

  return page.$$eval(selectors.performers, (performerEls) => {
    return performerEls.map((performerEl) => {
      const position = performerEl
        .querySelector(".text-start")
        ?.textContent.trim();
      const name = performerEl
        .querySelector(".text-center a span")
        ?.textContent.trim();
      const performance = performerEl
        .querySelector(".text-center a")
        ?.getAttribute("href")
        .replace(/[.]\d+/g, "");
      const stageTime = performerEl
        .querySelector(".text-end")
        ?.textContent.trim();

      return { position, name, stageTime, performance };
    });
  });
}

async function getLatestStoredEpisode(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(data);

    const keys = Object.keys(jsonData).map(Number);
    const highestKey = Math.max(...keys);

    return highestKey;
  } catch (err) {
    console.error("An error occurred while reading the file:", err);
    throw err; // Rethrow the error for the caller to handle
  }
}

async function getTextContent(handle) {
  return handle.evaluate((node) => node.textContent.trim());
}

async function updateMissingEpisodes() {
  const latestStoredEpisode = await getLatestStoredEpisode(
    "commands/killtony/data/data.json"
  );

  if (latestShow.latestEpisode == latestStoredEpisode) {
    console.log(`Episode ${latestShow.latestEpisode} was previously scraped`);
  } else {
    await updateJsonFile(
      "commands/killtony/data/data.json",
      latestShow.latestEpisode,
      latestShow
    );
  }
}

async function updateJsonFile(filePath, latestEpisode, newData) {
  try {
    const newKey = latestEpisode.toString();

    const data = await fs.readFile(filePath, "utf8");
    let jsonData = JSON.parse(data);
    jsonData[newKey] = newData;

    const updatedJsonString = JSON.stringify(jsonData, null, 2);
    await fs.writeFile(filePath, updatedJsonString, "utf8");

    console.log(`JSON file has been updated with episode number ${newKey}`);
  } catch (err) {
    console.error("An error occurred:", err);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const setUserAgent = async (page) => {
  // Pass the User-Agent Test.
  const userAgent =
    "Mozilla/5.0 (X11; Linux x86_64)" +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36";
  await page.setUserAgent(userAgent);
};

scrape();
