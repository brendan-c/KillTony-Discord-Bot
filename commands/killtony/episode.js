const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { shortenURL } = require('../../utils.js')
const fs = require('fs');

// Load your data file
const data = JSON.parse(fs.readFileSync('commands/killtony/data/data.json', 'utf8'));


module.exports = {
    data: new SlashCommandBuilder()
        .setName('episode')
        .setDescription('Get information about a specific episode.')
        .addStringOption(option =>
            option.setName('number')
                .setDescription('The episode number or type "latest" for the most recent episode')
                .setRequired(true)
        ),
    async execute(interaction) {
        let episodeNumber = interaction.options.getString('number');

        // Check if the user requested the latest episode
        if (episodeNumber.toLowerCase() === 'latest') {
            const episodeNumbers = Object.keys(data).map(num => parseInt(num)).filter(num => !isNaN(num));
            const latestEpisodeNumber = Math.max(...episodeNumbers);
            episodeNumber = latestEpisodeNumber.toString();
        }

        if (data[episodeNumber]) {
            const episode = data[episodeNumber];
            const guests = Array.isArray(episode.guests) ? episode.guests.join(', ') : episode.guests;
            const venue = episode.venue || 'Unknown Venue';

            // Create embed
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Kill Tony #${episodeNumber}`)
                .setURL(episode.url)
                .setDescription(`**Venue:** ${venue}\n**Guests:** ${guests}`)
                .setTimestamp()
                .setFooter({ text: 'Data source: skanks.xyz/kt/' });

            // Handling long performer lists
            let performerDetails = '';
            for (const performer of episode.performers) {
                const detail = `[${performer.name}](${shortenURL(performer.performance)})\n`;
                if (performerDetails.length + detail.length > 1024) {
                    embed.addFields({ name: 'Performers', value: performerDetails });
                    performerDetails = detail; // Start new field with current detail
                } else {
                    performerDetails += detail;
                }
            }

            // Add remaining performer details
            if (performerDetails) {
                embed.addFields({ name: 'Performers', value: performerDetails });
            }

            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply(`Episode ${episodeNumber} not found.`);
        }
    }
};