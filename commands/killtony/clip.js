const { SlashCommandBuilder } = require('discord.js');
const { searchByName } = require("../../utility/search");
const Fuse = require('fuse.js');

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

        // Use the search function to get performer results
        const { performerResults } = await searchByName(searchName);

        // Filter results by episode number
        const results = performerResults.filter(result => result.e.toString() === episodeNumber);

        if (results.length > 0) {
            const firstMatch = results[0];
            // Use Fuse.js to perform a fuzzy search on performer names
            const fuse = new Fuse(firstMatch.p, {
                keys: ['n'],
                includeScore: true,
                threshold: 0.3,
                isCaseSensitive: false
            });
            const performerMatches = fuse.search(searchName);

            if (performerMatches.length > 0) {
                const { item: performerLink } = performerMatches[0]; // Get the best match
                const formattedResult = `Clip of ${performerLink.n}'s set on episode #${firstMatch.e}: ${performerLink.l}`;
                await interaction.reply({ content: formattedResult });
            } else {
                await interaction.reply(`No matching performance found for '${searchName}' in Episode #${episodeNumber}.`);
            }
        } else {
            await interaction.reply(`No matching performer found in Episode #${episodeNumber}.`);
        }
    }
};
