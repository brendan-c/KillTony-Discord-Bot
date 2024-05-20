const { SlashCommandBuilder } = require("discord.js");
const { fetchAndDisplayEpisode } = require("../../utility/episodeUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("episode")
        .setDescription("Get information about a specific episode.")
        .addStringOption(option =>
            option.setName("number").setDescription("The episode number").setRequired(true)
        ),
    async execute(interaction) {
        const episodeNumber = interaction.options.getString("number");
        await fetchAndDisplayEpisode(interaction, episodeNumber);
    },
};
