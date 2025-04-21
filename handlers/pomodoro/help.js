// handlers/pomodoro/help.js
import { EmbedBuilder } from "discord.js";

export async function handleHelp(interaction) {
  const helpEmbed = new EmbedBuilder()
    .setColor("#FFA500")
    .setTitle("📘 Pomodoro Bot Help")
    .setDescription("Here are the available commands for managing your Pomodoro sessions. Stay focused and productive!")
    .addFields(
      { name: "**/pomodoro setup**", value: "Configure your Pomodoro durations, breaks, and session limits." },
      { name: "**/pomodoro start**", value: "Start a Pomodoro session with default setup (25/5/15) with 4 sessions in total." },
      { name: "**/pomodoro rest**", value: "Take a short manual break. Perfect for a quick recharge!" },
      { name: "**/pomodoro stopsession**", value: "Stop the currently active session and reset your progress." },
      { name: "**/pomodoro skip**", value: "Skip the current ongoing session (e.g., study → break)." },
      { name: "**/pomodoro help**", value: "Display this helpful guide." }
      // { name: "/pomodoro status", value: "Check the current status of your Pomodoro session." } // Uncomment if enabled
    )
    .setFooter({ text: "Stay focused and crush your goals 💪" })
    .setTimestamp();

  await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
}
