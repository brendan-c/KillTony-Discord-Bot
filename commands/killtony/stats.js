// stats command
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGuestStats, getPerformerStats, getVenueStats } = require("../../utility/stats");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Get statistics about the show')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of statistics to retrieve')
                .setRequired(true)
                .addChoices(
                    { name: 'Most Frequent Guests', value: 'guests' },
                    { name: 'Most Appearances by Performers', value: 'performers' },
                    { name: 'Number of Episodes by Venue', value: 'venues' }
                )),
    async execute(interaction) {
        const type = interaction.options.getString('type');
        let embed = new EmbedBuilder().setColor("#0099ff").setTimestamp();

        switch (type) {
            case 'guests':
                const guestStats = await getGuestStats();
                embed.setTitle("Most Frequent Guests")
                     .setDescription(guestStats.map(guest => `**${guest[0]}**: ${guest[1]} appearances`).join('\n'));
                break;
            case 'performers':
                const performerStats = await getPerformerStats();
                embed.setTitle("Most Appearances by Performers")
                     .setDescription(performerStats.map(performer => `**${performer[0]}**: ${performer[1]} appearances`).join('\n'));
                break;
            case 'venues':
                const venueStats = await getVenueStats();
                embed.setTitle("Number of Episodes by Venue")
                     .setDescription(venueStats.map(venue => `**${venue[0]}**: ${venue[1]} episodes`).join('\n'));
                break;
            default:
                await interaction.reply('Unknown statistics type!');
                return;
        }

        await interaction.reply({ embeds: [embed] });
    }
};
