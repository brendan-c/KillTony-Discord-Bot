const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays help information for available commands'),
    async execute(interaction) {
        const { commands } = interaction.client;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Help Menu')
            .setDescription('Here are the available commands for the bot:');

        commands.forEach(command => {
            // Add each command's name and description to the embed
            embed.addFields({ name: `/${command.data.name}`, value: command.data.description || 'No description available' });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

