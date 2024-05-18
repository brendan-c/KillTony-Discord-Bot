const { SlashCommandBuilder } = require('discord.js');
const { searchByName } = require('../../utility/search'); // Adjust path as needed
const { sendPaginatedEmbed } = require('../../utility/commandUtils'); // Ensure this path is correct

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guest')
        .setDescription('Get episodes featuring a specific guest.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The partial or full name of the guest')
                .setRequired(true)),
    
    async execute(interaction) {
        const searchName = interaction.options.getString('name');

        // Perform the search
        const { guestResults } = await searchByName(searchName);

        // Helper function to format guest episode details
        function formatGuestEpisode(episode) {
            return `[#${episode.e}](${episode.l}) – ${episode.matchedName}`;
        }

        // Use in the main execute function
        let searchResults = guestResults.map(formatGuestEpisode);

        const title = `Guest appearences by "${searchName}"`;
        // Use the utility to send paginated embeds
        await sendPaginatedEmbed(interaction, searchResults, 8, title); // Adjust the number per page as needed
    }
};
