import {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
  } from "discord.js";
  import { Session } from "../models/sessions.models.js";
  
  export async function getSessionEmbed(userId) {
    const session = await Session.findOne({ userId });
    if (!session) return { embed: null, components: [] };
  
    const {
      currentPhase,
      endTime,
      completedSessions,
      maxSessions,
      workDuration,
      breakDuration,
      longBreakDuration,
    } = session;
  
    // 🕒 Calculate remaining time using Discord timestamp
    const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);
  
    // ▓ Progress Bar
    const total = maxSessions;
    const filled = completedSessions;
    const empty = total - filled;
    const progressBar = "█ ".repeat(filled) + "░ ".repeat(empty);
  
    // ✍️ Phase Title
    const phaseTitle =
      currentPhase === "study"
        ? "📚 Study"
        : currentPhase === "break"
        ? "☕ Short Break"
        : "🌴 Long Break";
  
    const embed = new EmbedBuilder()
      .setTitle(`${phaseTitle} Phase`)
      .setDescription(
        `**Ends <t:${endTimestamp}:R>** • <t:${endTimestamp}:T>\n\n**Progress:**\n${progressBar}`
      )
      .setColor(
        currentPhase === "study"
          ? 0x3498db // blue
          : currentPhase === "break"
          ? 0xf1c40f // yellow
          : 0x2ecc71 // green
      )
      .setFooter({
        text: `Session ${completedSessions} / ${maxSessions}`,
      });
  
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("skip_phase")
        .setLabel("⏭️ Skip Phase")
        .setStyle(ButtonStyle.Primary),
  
      new ButtonBuilder()
        .setCustomId("stop_session")
        .setLabel("⛔ Stop Session")
        .setStyle(ButtonStyle.Danger)
    );
  
    return { embed, components: [row] };
  }
  