// handlers/pomodoro/skip.js
import { Session } from "../../models/sessions.models.js";
import { activeTimers, startPomodoroLoop } from "../../utils/pomodoroScheduler.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export async function handleSkip(interaction) {
  const userId = interaction.user.id;

  try {
    const session = await Session.findOne({ userId, isActive: true });

    if (!session) {
      const replyOptions = {
        content: "❌ No active session to skip.",
        ephemeral: interaction.isButton?.() ? true : false,
      };
      return interaction.reply(replyOptions);
    }

    // Clear the current timer
    const timer = activeTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      activeTimers.delete(userId);
    }

    // Log current session state
    const {
      phase,
      completedSessions,
      sessionsBeforeLongBreak,
      maxSessions,
    } = session;

    // Determine next phase
    let nextPhase = "study";
    let incrementSession = false;

    if (phase === "study") {
      incrementSession = true;

      const newCount = completedSessions + 1;
      session.completedSessions = newCount;

      if (newCount >= maxSessions) {
        nextPhase = "longBreak";
      } else if (newCount % sessionsBeforeLongBreak === 0) {
        nextPhase = "longBreak";
      } else {
        nextPhase = "break";
      }
    } else {
      // Skipping a break or long break → go to study
      nextPhase = "study";
    }

    session.phase = nextPhase;
    session.endTime = new Date();
    await session.save();

    const replyMsg =
      nextPhase === "study"
        ? "⏩ Skipped! Time to focus again. 🔥"
        : nextPhase === "break"
        ? "⏩ Skipped! Take a short break now. ☕"
        : "⏩ Skipped! Long break time. 🌴";

    if (interaction.isButton?.()) {
      await interaction.reply(replyMsg);

      if (interaction.message) {
        const updatedRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("start_session")
            .setLabel("▶️ Start Session")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("stop_session")
            .setLabel("⛔ Stop")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(false),
          new ButtonBuilder()
            .setCustomId("skip_phase")
            .setLabel("⏭️ Skip Phase")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false)
        );

        await interaction.message.edit({ components: [updatedRow] });
      }
    } else {
      await interaction.reply(replyMsg);
    }

    startPomodoroLoop(userId, interaction.client, interaction.channelId);

  } catch (err) {
    const errorMsg = "⚠️ Something went wrong while skipping.";
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(errorMsg);
    } else {
      await interaction.reply({ content: errorMsg, ephemeral: true });
    }
  }
}
