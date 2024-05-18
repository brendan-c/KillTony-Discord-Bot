const { SlashCommandBuilder } = require("discord.js");
const { searchByName } = require("../../utility/search");
const { sendPaginatedEmbed } = require("../../utility/commandUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search for episodes by name.")
    .addStringOption((option) =>
      option.setName("name").setDescription("Enter a name").setRequired(true)
    ),
  async execute(interaction) {
    const searchName = interaction.options.getString("name");
    const { guestResults, performerResults } = await searchByName(searchName);

    // Helper function to format guest episode entry
    function formatGuestEpisode(guest) {
      return `[#${guest.e}](${guest.l}) - ${guest.matchedName} (Guest)`;
    }

    // Helper function to format performer episode entry
    function formatPerformerLink(performer, matchedName) {
      return performer.n === matchedName
        ? `[${matchedName}](${performer.l})`
        : null;
    }

    // Function to format episode details
    function formatPerformerEpisode(episode) {
      // Generate links only for the matched performers
      const performerLinks = episode.p
        .map((performer) => formatPerformerLink(performer, episode.matchedName))
        .filter((link) => link !== null); // Filter out null values

      // Join all valid links with a comma and return the formatted string
      return `[#${episode.e}](${episode.l}) – ${performerLinks.join(
        ", "
      )} (Performer)`;
    }

    // Use in the main execute function or where applicable
    let results = guestResults
      .map(formatGuestEpisode)
      .concat(performerResults.map(formatPerformerEpisode));

    const title = `Episodes featuring "${searchName}" `
    await sendPaginatedEmbed(interaction, results, 8, title);
  },
};
