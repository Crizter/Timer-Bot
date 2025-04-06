import { Session } from "../../models/sessions.models.js";
import { startPomodoroLoop } from "../../utils/pomodoroScheduler.js";

export const handleStart = async (interaction, client) => {
  const userId = interaction.user.id;

  try {
    await interaction.deferReply();

    // Check for an existing active session
    const existingSession = await Session.findOne({ userId, isActive: true });
    if (existingSession) {
      return interaction.editReply({
        content: "⚠️ You already have an active Pomodoro session!",
      });
    }

    // Use saved setup or default
    const userSession = await Session.findOne({ userId });
    const sessionData = {
      userId,
      workDuration: userSession?.workDuration || 25,
      breakDuration: userSession?.breakDuration || 5,
      longBreakDuration: userSession?.longBreakDuration || 15,
      sessionsBeforeLongBreak: userSession?.sessionsBeforeLongBreak || 4,
      completedSessions: 0,
      currentPhase: "study",
      isActive: true,
    };

    // Create or overwrite the session
    await Session.findOneAndUpdate({ userId }, sessionData, { upsert: true });

    // Confirm session start
    await interaction.editReply(`⏳ Pomodoro session started!\nFocus for **${sessionData.workDuration} minutes**. Let’s get it! 🚀`);

    // 🔁 Begin the loop
    startPomodoroLoop(userId, client);

  } catch (err) {
    console.error("❌ Failed to start session:", err);
    await interaction.editReply({
      content: "❌ Something went wrong while starting your session.",
    });
  }
};
