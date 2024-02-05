const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { shortenURL, searchByName } = require("../../utils.js");
const fs = require("fs");

// Load your data file
const data = JSON.parse(
  fs.readFileSync("commands/killtony/data/data.json", "utf8")
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("performer")
    .setDescription("Get episodes featuring a specific performer.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The partial or full name of the performer")
        .setRequired(true)
    ),
  async execute(interaction) {
    const searchName = interaction.options.getString("name").toLowerCase();

    let searchResults = searchByName(data, "performer", searchName);
    
    let episodesFound = searchResults.map((result) => {
      return `[#${result.episodeNumber}](${result.episodeUrl})  –  [${
        result.name
      }](${shortenURL(result.performance)})`;
    });
    // console.log(episodesFound)
    // Paginate results
    const itemsPerPage = 8;
    const pages =
      episodesFound.length > 0
        ? Math.ceil(episodesFound.length / itemsPerPage)
        : 1;
    let currentPage = 1;

    const generateEmbed = (page) => {
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const currentItems = episodesFound.slice(start, end);
  
      const embed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle(`Episodes featuring performer(s) "${searchName}"`)
          .setTimestamp()
          .setFooter({ text: `Page ${page} of ${pages} • Data source: skanks.xyz/kt/` })
          .addFields({ name: "Episode - Matched Name", value: currentItems.join("\n") || "No episodes found" });
  
      return embed;
  };

    const generateButtons = (currentPage) => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("first")
          .setLabel("«")
          .setStyle(ButtonStyle.Success) // Red color
          .setDisabled(currentPage === 1),
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("←")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 1),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("→")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === pages),
        new ButtonBuilder()
          .setCustomId("last")
          .setLabel("»")
          .setStyle(ButtonStyle.Danger) // Green color
          .setDisabled(currentPage === pages)
      );
    };

    await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: pages > 1 ? [generateButtons(currentPage)] : [],
    });

    // Handle button interactions for pagination
    const collector = interaction.channel.createMessageComponentCollector({
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (!i.isButton()) return;

      const originalInteraction = i.message.interaction;

      if (originalInteraction.id !== interaction.id) {
        // Ignore the button press as it's not for this interaction
        return;
      }

      if (i.customId === "first") {
        currentPage = 1;
      } else if (i.customId === "previous" && currentPage > 1) {
        currentPage--;
      } else if (i.customId === "next" && currentPage < pages) {
        currentPage++;
      } else if (i.customId === "last") {
        currentPage = pages;
      }

      await i.update({
        embeds: [generateEmbed(currentPage)],
        components: [generateButtons(currentPage)],
      });
    });

    collector.on("end", () => {
      interaction.editReply({ components: [] }).catch(console.error);
    });
  },
};
