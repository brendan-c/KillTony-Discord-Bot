const { SlashCommandBuilder } = require("discord.js");
const { searchByName } = require("../../utility/search");
const { sendPaginatedEmbed } = require("../../utility/commandUtils");
const { fetchAndDisplayEpisode } = require("../../utility/episodeUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("Search for episodes by name or number.")
        .addStringOption((option) =>
            option.setName("name").setDescription("Enter a name or episode number starting with #").setRequired(true)
        ),
    async execute(interaction) {
        const searchQuery = interaction.options.getString("name");

        // Check if the query is an episode number (e.g., "#405")
        if (searchQuery.startsWith('#')) {
            const episodeNumber = searchQuery.slice(1); // Remove the '#' to get the episode number
            await fetchAndDisplayEpisode(interaction, episodeNumber);
            return;
        }

        const { guestResults, performerResults } = await searchByName(searchQuery);
        let results = guestResults.map(guest => `[#${guest.e}](${guest.l}) - ${guest.matchedName} (Guest)`)
                         .concat(performerResults.map(performer => `[#${performer.e}](${performer.l}) - ${performer.matchedName} (Performer)`));

        const title = `Episodes featuring "${searchQuery}" `;
        await sendPaginatedEmbed(interaction, results, 8, title);
    },
};
