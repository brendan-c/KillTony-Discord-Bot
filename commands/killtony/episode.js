const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
    shortenURL,
    normalizeText,
    readDataFromFile,
} = require("../../utility/utils");
const { searchByEpisode } = require("../../utility/search");
const fs = require("fs");
const path = require("path");

const localDataFile = path.join(__dirname, "..", "..", "data", "master.json");

// Load data
const data = readDataFromFile(localDataFile);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("episode")
        .setDescription("Get information about a specific episode.")
        .addStringOption((option) =>
            option
                .setName("number")
                .setDescription(
                    'The episode number or type "latest" for the most recent episode',
                )
                .setRequired(true),
        ),
    async execute(interaction) {
        let episodeNumber = interaction.options.getString("number");
        const episode = await searchByEpisode(episodeNumber);
        if (episode) {
            const guests = Array.isArray(episode.g)
                ? episode.g.join(", ")
                : episode.g;
            const venue = episode.v || "Unknown Venue";

            // Create embed
            const embed = new EmbedBuilder()
                .setColor("#0099ff")
                .setTitle(`KillTony #${episode.e}`)
                .setURL(episode.l)
                .setThumbnail(`https://img.youtube.com/vi/${episode.y}/hqdefault.jpg`)
                .setDescription(`**Venue:** ${venue}\n**Guests:** ${guests}\n**Date Filmed:** ${episode.d}`)
                .setTimestamp()
                .setFooter({ text: "Data source: skanks.xyz/kt/" });

            // Handling long performer lists
            let performerDetails = "";
            for (const performer of episode.p) {
                const detail = `[${performer.n}](${shortenURL(performer.l)})\n`;
                if (performerDetails.length + detail.length > 1024) {
                    embed.addFields({
                        name: "Performers",
                        value: performerDetails,
                    });
                    performerDetails = detail; // Start new field with current detail
                } else {
                    performerDetails += detail;
                }
            }

            // Add remaining performer details
            if (performerDetails) {
                embed.addFields({
                    name: "Performers",
                    value: performerDetails,
                });
            }
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply(`Episode ${episodeNumber} not found.`);
        }
    },
};
