const { EmbedBuilder } = require("discord.js");
const { searchByEpisode } = require("./search");
const { shortenURL } = require("./utils");

async function fetchAndDisplayEpisode(interaction, episodeNumber) {
    const episode = await searchByEpisode(episodeNumber);
    if (!episode) {
        await interaction.reply(`Episode ${episodeNumber} not found.`);
        return;
    }

    const guests = Array.isArray(episode.g) ? episode.g.join(", ") : episode.g;
    const venue = episode.v || "Unknown Venue";

    const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`KillTony #${episode.e}`)
        .setURL(episode.l)
        .setThumbnail(`https://img.youtube.com/vi/${episode.y}/hqdefault.jpg`)
        .setDescription(`**Venue:** ${venue}\n**Guests:** ${guests}\n**Date Filmed:** ${episode.d}`)
        .setTimestamp()
        .setFooter({ text: "Data source: skanks.xyz/kt/" });

    let performerDetails = "";
    for (const performer of episode.p) {
        const detail = `[${performer.n}](${shortenURL(performer.l)})\n`;
        if (performerDetails.length + detail.length > 1024) {
            embed.addFields({ name: "Performers", value: performerDetails });
            performerDetails = detail;
        } else {
            performerDetails += detail;
        }
    }

    if (performerDetails) {
        embed.addFields({ name: "Performers", value: performerDetails });
    }

    await interaction.reply({ embeds: [embed] });
}

module.exports = { fetchAndDisplayEpisode };
