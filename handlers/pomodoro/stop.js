// commands/pomodoro/stopsession.js
import { Session } from "../../models/sessions.models.js";
import { activeTimers } from "../../utils/pomodoroScheduler.js"; // Import timer map

export async function handleStopSession(interaction) {
  const userId = interaction.user.id;

  try {
    await interaction.deferReply({ ephemeral: false });

    const session = await Session.findOne({ userId, isActive: true });

    if (!session) {
      return interaction.editReply({
        content: "❌ No active session to stop.",
      });
    }

    // Clear the active timer
    const timer = activeTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      activeTimers.delete(userId);
    }

    await Session.deleteOne({ _id: session._id });

    await interaction.editReply("⏹️ Your Pomodoro session has been stopped. Take care!");
  } catch (err) {
    console.error("❌ Failed to stop session:", err);
    await interaction.editReply("⚠️ An error occurred while stopping your session.");
  }
}
