const { SlashCommandBuilder } = require('discord.js');
const { searchByVenue } = require('../../utility/search');
const { sendPaginatedEmbed } = require('../../utility/commandUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('venue')
        .setDescription('Get episodes by venue name.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Statecode and/or venue name')
                .setRequired(true)),

    async execute(interaction) {
        const venueName = interaction.options.getString('name');
        const results = await searchByVenue(venueName);

        // Format the results
        const episodesFound = results.map(res => {
            return `[#${res.e}](${res.l}) - ${res.v}`;
        });

        // Use the utility to send paginated embeds
        await sendPaginatedEmbed(interaction, episodesFound, 5, `Episodes filmed at venue "${venueName}"`);
    }
};
