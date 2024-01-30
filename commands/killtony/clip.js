const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { searchByName } = require("../../utils.js");
const fs = require('fs');

// Load your data file
const data = JSON.parse(fs.readFileSync('commands/killtony/data/data.json', 'utf8'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clip')
        .setDescription('Get the performance clip of a specific performer in an episode.')
        .addStringOption(option =>
            option.setName('episode')
                .setDescription('The episode number')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name of the performer')
                .setRequired(true)
        ),
    async execute(interaction) {
        const episodeNumber = interaction.options.getString('episode');
        const searchName = interaction.options.getString('name').toLowerCase();

        // Use the search function
        let searchResults = searchByName(data, 'performer', searchName, episodeNumber);

        // Handle the search results
        if (searchResults.length > 0) {
            const firstMatch = searchResults[0]; // Assuming you want the first match
            console.log(firstMatch)
            const formattedResult = `Clip of ${firstMatch.name}'s performance on episode #${firstMatch.episodeNumber}: ${firstMatch.performance}`;
            await interaction.reply(formattedResult);
        } else {
            await interaction.reply(`No matching performer found in Episode #${episodeNumber}.`);
        }
    }
};
