const path = require("path");
const { readDataFromFile } = require('./utils');

const localDataFile = path.join(__dirname, "..", "data", "master.json");

async function getGuestStats() {
    const data = await readDataFromFile(localDataFile);
    let guestCounts = {};
    data.forEach(show => {
        if (show.g) {
            show.g.forEach(guest => {
                // Ignore episodes with no guests
                if (guest && guest.trim()) {
                    guestCounts[guest] = (guestCounts[guest] || 0) + 1;
                }
            });
        }
    });
    const sortedGuests = Object.entries(guestCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return sortedGuests;
}


async function getPerformerStats() {
    const data = await readDataFromFile(localDataFile);
    let performerCounts = {};
    data.forEach(show => {
        if (show.p) {
            show.p.forEach(performer => {
                performerCounts[performer.n] = (performerCounts[performer.n] || 0) + 1;
            });
        }
    });
    const sortedPerformers = Object.entries(performerCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return sortedPerformers;
}

async function getVenueStats() {
    const data = await readDataFromFile(localDataFile);
    let venueCounts = {};
    data.forEach(show => {
        venueCounts[show.v] = (venueCounts[show.v] || 0) + 1;
    });
    const sortedVenues = Object.entries(venueCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return sortedVenues;
}

module.exports = {
    getGuestStats,
    getPerformerStats,
    getVenueStats,
};
