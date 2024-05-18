const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const DATA_URL = 'https://skanks.xyz/kt/shows.json';
const DATA_PATH = path.join(__dirname, 'data/lastData.json');

// Dynamically import node-fetch
let fetch;
import('node-fetch').then(mod => {
    fetch = mod.default;
    checkForChanges(); // Start the check after fetch is loaded
});

// Function to fetch data from the URL
async function fetchData() {
    const response = await fetch(DATA_URL);
    const data = await response.json();
    return data;
}

// Function to save data to a file
function saveData(data) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data));
}

// Function to read saved data from a file
function readSavedData() {
    if (fs.existsSync(DATA_PATH)) {
        return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    }
    return null;
}

// Function to check for changes
async function checkForChanges() {
    console.log('Checking for changes to https://skanks.xyz/kt/shows.json...');
    const newData = await fetchData();
    const oldData = readSavedData();

    if (!oldData || JSON.stringify(newData) !== JSON.stringify(oldData)) {
        console.log('Data has changed. Running getData.js...');
        exec('node utility/getData.js', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        });

        // Save the new data
        saveData(newData);
    } else {
        console.log('No changes detected.');
    }
}

// Set an interval to check for changes every 6 hours
setInterval(checkForChanges, 6 * 60 * 60 * 1000);