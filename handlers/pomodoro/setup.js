// commands/pomodoro/setup.js
import { Session } from "../../models/sessions.models.js";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export async function handleSetup(interaction) {
  const work = interaction.options.getInteger("work");
  const shortBreak = interaction.options.getInteger("break");
  const longBreak = interaction.options.getInteger("longbreak");
  const sessions = interaction.options.getInteger("sessions");
  const maxSessions = interaction.options.getInteger("max-sessions") ?? sessions;

  try {
    await interaction.deferReply({ ephemeral: false });

    if (maxSessions < sessions) {
      return interaction.editReply({
        content: "⚠️ `max-sessions` must be greater than or equal to `sessions` (sessions before long break).",
        ephemeral: true,
      });
    }

    await Session.findOneAndUpdate(
      { userId: interaction.user.id },
      {
        workDuration: work,
        breakDuration: shortBreak,
        longBreakDuration: longBreak,
        sessionsBeforeLongBreak: sessions,
        maxSessions: maxSessions,
        isActive: false,
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Embed creation
    const embed = new EmbedBuilder()
      .setTitle("✅ Pomodoro Session")
      .setDescription("Your custom Pomodoro routine has been saved. Here's a summary:")
      .addFields(
        { name: "⏱️ Work", value: `\`${work} min\``, inline: true },
        { name: "☕ Break", value: `\`${shortBreak} min\``, inline: true },
        { name: "🌴 Long Break", value: `\`${longBreak} min\``, inline: true },
        { name: "🔁 Sessions Before Long Break", value: `\`${sessions}\``, inline: true },
        { name: "🎯 Max Sessions", value: `\`${maxSessions}\``, inline: true }
      )
      .setColor("Green")
      .setFooter({ text: "Use the buttons below to begin or manage your Pomodoro cycle!" });

    // Action buttons
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("start_session")
        .setLabel("▶️ Start Session")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("stop_session")
        .setLabel("⛔ Stop")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true), // disabled by default here

      new ButtonBuilder()
        .setCustomId("skip_phase")
        .setLabel("⏭️ Skip Phase")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true) // disabled unless session is running
    );

    await interaction.editReply({
      embeds: [embed],
      components: [row],
    });
  } catch (err) {
    console.error("❌ Pomodoro setup failed:", err);
    await interaction.editReply("❌ Failed to save your Pomodoro setup. Please try again.");
  }
}
