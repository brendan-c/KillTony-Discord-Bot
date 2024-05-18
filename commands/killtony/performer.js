const { SlashCommandBuilder } = require('discord.js');
const { searchByName } = require('../../utility/search'); // Adjust path as needed
const { sendPaginatedEmbed } = require('../../utility/commandUtils'); // Make sure the path matches where your utilities are
const { shortenURL } = require('../../utility/utils')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('performer')
        .setDescription('Get episodes featuring a specific performer.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The partial or full name of the performer')
                .setRequired(true)),
    
    async execute(interaction) {
        const searchName = interaction.options.getString('name');

        // Perform the search
        const { performerResults } = await searchByName(searchName);

        function formatPerformerLink(performer, matchedName) {
            return performer.n === matchedName ? `[${matchedName}](${shortenURL(performer.l)})` : null;
        }
        
        // Function to format episode details
        function formatEpisode(episode) {
            // Generate links only for the matched performers
            const performerLinks = episode.p
                .map(performer => formatPerformerLink(performer, episode.matchedName))
                .filter(link => link !== null);  // Filter out null values
        
            // Join all valid links with a comma and return the formatted string
            return `[#${episode.e}](${episode.l}) – ${performerLinks.join(', ')}`;
        }
        
        // Use in the main execute function
        let searchResults = performerResults.map(formatEpisode);

        const title = `Performances by "${searchName}"`;

        // Use the utility to send paginated embeds
        await sendPaginatedEmbed(interaction, searchResults, 8, title); // Adjust the number per page as needed
    }
};
