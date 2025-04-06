// handleStart.js
import { Session } from "../../models/sessions.models.js";
import { startPomodoroLoop } from "../../utils/pomodoroScheduler.js";

export const handleStart = async (interaction, client) => {
  const userId = interaction.user.id;

  try {
    await interaction.deferReply();

    const existingSession = await Session.findOne({ userId, isActive: true });
    if (existingSession) {
      return interaction.editReply({
        content: "⚠️ You already have an active Pomodoro session!",
      });
    }

    const userSession = await Session.findOne({ userId });

    const sessionData = {
      userId,
      workDuration: userSession?.workDuration || 25,
      breakDuration: userSession?.breakDuration || 5,
      longBreakDuration: userSession?.longBreakDuration || 15,
      sessionsBeforeLongBreak: userSession?.sessionsBeforeLongBreak || 4,
      maxSessions: userSession?.maxSessions || userSession?.sessionsBeforeLongBreak || 4,
      completedSessions: 0,
      currentPhase: "study",
      isActive: true,
    };

    await Session.findOneAndUpdate({ userId }, sessionData, { upsert: true });

    await interaction.editReply(`⏳ Pomodoro session started!\nFocus for **${sessionData.workDuration} minutes**. Let’s get it! 🚀`);

    startPomodoroLoop(userId, client);

  } catch (err) {
    console.error("❌ Failed to start session:", err);
    await interaction.editReply({
      content: "❌ Something went wrong while starting your session.",
    });
  }
};
