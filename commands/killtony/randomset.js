const { SlashCommandBuilder } = require('discord.js');
const { searchByName } = require("../../utility/search"); // Ensure your search utility can handle empty queries.

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomset')
        .setDescription('Get a clip of a random set or a specific performer\'s set.')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Name of the performer')
                .setRequired(false)  // Make the option not required
        ),
    async execute(interaction) {
        const performerName = interaction.options.getString('name');

        if (performerName) {
            // Search for a specific performer's sets
            const { performerResults } = await searchByName(performerName);

            // Filter results to include only episodes where the specified performer appears
            const specificPerformerResults = performerResults.filter(result =>
                result.p.some(performer => performer.n.toLowerCase() === performerName.toLowerCase())
            );

            if (specificPerformerResults.length > 0) {
                const randomEpisode = specificPerformerResults[Math.floor(Math.random() * specificPerformerResults.length)];
                const performerInfo = randomEpisode.p.find(performer => performer.n.toLowerCase() === performerName.toLowerCase());

                if (performerInfo) {
                    const formattedResult = `${performerInfo.n} on episode #${randomEpisode.e}: ${performerInfo.l}`;
                    await interaction.reply({ content: formattedResult });
                } else {
                    await interaction.reply(`No performance clips found for '${performerName}' in the filtered episodes.`);
                }
            } else {
                await interaction.reply(`No performances found for '${performerName}'.`);
            }
        } else {
            // Search for any performer's sets
            const { performerResults } = await searchByName('');

            if (performerResults.length > 0) {
                const randomEpisode = performerResults[Math.floor(Math.random() * performerResults.length)];
                const randomPerformer = randomEpisode.p[Math.floor(Math.random() * randomEpisode.p.length)];
                const formattedResult = `${randomPerformer.n} on episode #${randomEpisode.e}: ${randomPerformer.l}`;
                await interaction.reply({ content: formattedResult });
            } else {
                await interaction.reply('No performance clips are available.');
            }
        }
    }
};
