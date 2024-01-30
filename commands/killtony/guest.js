const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const Fuse = require("fuse.js");
const fs = require("fs");

// Load your data file
const data = JSON.parse(
  fs.readFileSync("commands/killtony/data/data.json", "utf8")
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guest")
    .setDescription("Get episodes featuring a specific guest.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The partial or full name of the guest")
        .setRequired(true)
    ),
  async execute(interaction) {
    const searchName = interaction.options.getString("name").toLowerCase();

    let allGuests = [];
    for (const episodeNumber in data) {
      const episode = data[episodeNumber];
      episode.guests.forEach((guest) => {
        allGuests.push({
          episodeNumber,
          episodeUrl: episode.url,
          name: guest,
        });
      });
    }

    // Setup Fuse.js
    const fuse = new Fuse(allGuests, {
      keys: ["name"],
      threshold: 0.3, // Adjust the threshold value as needed
    });

    // Perform the search
    const results = fuse.search(searchName);

    let episodesFound = results.map((result) => {
      const guest = result.item;
      return `[#${guest.episodeNumber}](${guest.episodeUrl}) – ${guest.name}`;
    });

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
        .setTitle(`Episodes featuring guest(s) "${searchName}"`)
        // .setDescription(currentItems.join('\n') || 'No episodes found')
        .setTimestamp()
        .setFooter({
          text: `Page ${page} of ${pages} • Data source: skanks.xyz/kt/`,
        })
        .addFields({
          name: "Episode - Matched Name",
          value: currentItems.join("\n") || "No episodes found",
        });

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
    const filter = (i) =>
      i.isButton() &&
      ["first", "previous", "next", "last"].includes(i.customId);
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 120000,
    }); // 2 minutes

    collector.on("collect", async (i) => {
      if (i.message.interaction.id !== interaction.id) return; // Ensure it's the correct interaction

      switch (i.customId) {
        case "first":
          currentPage = 1;
          break;
        case "previous":
          currentPage = Math.max(1, currentPage - 1);
          break;
        case "next":
          currentPage = Math.min(pages, currentPage + 1);
          break;
        case "last":
          currentPage = pages;
          break;
        default:
          return;
      }

      await i
        .update({
          embeds: [generateEmbed(currentPage)],
          components: [generateButtons(currentPage)],
        })
        .catch(console.error); // Catch potential errors
    });

    collector.on("end", () => {
      interaction.editReply({ components: [] }).catch(console.error); // Disable buttons after collector ends
    });
  },
};
