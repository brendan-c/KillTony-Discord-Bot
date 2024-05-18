const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createEmbed(title, description, page, totalPages) {
    return new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(title)
        .setDescription(description)
        .setFooter({ text: `Page ${page} of ${totalPages} • Data source: skanks.xyz/kt/` })
        .setTimestamp();
}

function createPaginationButtons(currentPage, totalPages, interactionId) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`first_${interactionId}`).setLabel('«').setStyle(ButtonStyle.Success).setDisabled(currentPage <= 1),
        new ButtonBuilder().setCustomId(`previous_${interactionId}`).setLabel('←').setStyle(ButtonStyle.Primary).setDisabled(currentPage <= 1),
        new ButtonBuilder().setCustomId(`next_${interactionId}`).setLabel('→').setStyle(ButtonStyle.Primary).setDisabled(currentPage >= totalPages),
        new ButtonBuilder().setCustomId(`last_${interactionId}`).setLabel('»').setStyle(ButtonStyle.Danger).setDisabled(currentPage >= totalPages)
    );
}

async function sendPaginatedEmbed(interaction, items, itemsPerPage, title="Search result(s):") {
    const pages = Math.ceil(items.length / itemsPerPage);
    let currentPage = 1;
    const interactionId = interaction.id; // Unique identifier for this interaction

    const updateMessage = async (page) => {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const currentItems = items.slice(start, end);
        const embed = createEmbed(title, currentItems.join('\n') || 'No results found', page, pages);
        const buttons = createPaginationButtons(page, pages, interactionId);
        return { embeds: [embed], components: pages > 1 ? [buttons] : [] };
    };

    await interaction.deferReply();
    await interaction.editReply(await updateMessage(currentPage));

    const collector = interaction.channel.createMessageComponentCollector({ time: 300000 });
    collector.on('collect', async (i) => {
        const [action, id] = i.customId.split('_');
        if (id !== interactionId) return;  // Ignore if the interaction ID does not match

        if (action === 'next' && currentPage < pages) currentPage++;
        else if (action === 'previous' && currentPage > 1) currentPage--;
        else if (action === 'first') currentPage = 1;
        else if (action === 'last') currentPage = pages;

        await i.deferUpdate();
        await i.editReply(await updateMessage(currentPage));
    });

    collector.on('end', () => {
        interaction.editReply({ components: [] }).catch(console.error);  // Clean up by removing buttons
    });
}

module.exports = {
    createEmbed,
    createPaginationButtons,
    sendPaginatedEmbed
};
