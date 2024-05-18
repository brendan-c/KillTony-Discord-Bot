const https = require("https");
const fs = require("fs").promises;

// Function to add episode numbers with 'e' as the first key, followed by 'l' for YouTube short URL
function addEpisodeNumbersAndYoutubeLink(data) {
    return data.map((item, index) => {
        let newItem = {
            e: index + 1, // Episode number
            l: item.y ? `https://youtu.be/${item.y}` : undefined, // YouTube short URL right after episode number
        };
        // Add all existing keys from the original item to the new item
        Object.keys(item).forEach((key) => {
            if (!newItem.hasOwnProperty(key)) {
                newItem[key] = item[key];
            }
        });
        return newItem;
    });
}

// Function to add YouTube URLs to each performer in a show
function addTimestampedYouTubeLinks(show) {
    const baseURL = "https://www.youtube.com/watch";
    if (show.y && Array.isArray(show.p)) {
        show.p.forEach((performer) => {
            const times = performer.t.split("-");
            const startTime = convertToSeconds(times[0]);
            const endTime = convertToSeconds(times[1]);
            performer.l = `${baseURL}?v=${show.y}&start=${startTime}${endTime ? `&end=${endTime}` : ""}`;
        });
    }
}

function convertToSeconds(time) {
    const parts = time.split(":").map((part) => parseFloat(part));
    let seconds = 0;
    if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        seconds = parts[0] * 60 + parts[1];
    }
    return Math.floor(seconds);
}

async function readDataFromFile(filePath) {
    try {
        const data = await fs.readFile(filePath, "utf8");
        return JSON.parse(data);
    } catch (e) {
        console.log(e);
    }
}

function normalizeText(text) {
    return text.toLowerCase();
}

function shortenURL(url) {
    if (!url) return "";
    let newURL = url.replace("youtube.com/watch?v=", "youtu.be/");
    newURL = newURL.replace("&start=", "&t=");
    newURL = newURL.split("&end")[0];
    return newURL;
}

module.exports = { readDataFromFile, normalizeText };

module.exports = {
    addEpisodeNumbersAndYoutubeLink,
    addTimestampedYouTubeLinks,
    readDataFromFile,
    normalizeText,
    shortenURL,
};
