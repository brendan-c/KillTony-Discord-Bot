const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

// Load your data file
const data = JSON.parse(fs.readFileSync('commands/killtony/data/data.json', 'utf8'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clip')
        .setDescription('Get the performance clip of a specific performer in an episode.')
        .addStringOption(option =>
            option.setName('episode')
                .setDescription('The episode number')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The partial name of the performer')
                .setRequired(true)
        ),
    async execute(interaction) {
        const episodeNumber = interaction.options.getString('episode');
        const partialPerformerName = interaction.options.getString('name').toLowerCase();

        if (data[episodeNumber]) {
            const episode = data[episodeNumber];
            const performer = episode.performers.find(p => p.name.toLowerCase().includes(partialPerformerName));

            if (performer) {
                await interaction.reply(`Performance link for ${performer.name} in Episode #${episodeNumber}: ${performer.performance}`);
            } else {
                await interaction.reply(`No performer matching '${partialPerformerName}' found in Episode #${episodeNumber}.`);
            }
        } else {
            await interaction.reply(`Episode #${episodeNumber} not found.`);
        }
    }
};
