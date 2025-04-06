import { Session } from "../../models/sessions.models.js";

export async function handleStatus(interaction) {
  try {
    const userId = interaction.user.id;
    const session = await Session.findOne({ userId });

    if (!session || !session.isActive) {
      return await interaction.reply({
        content: "❌ You don’t have any active Pomodoro session. Use `/pomodoro start` to begin one!",
        ephemeral: false,
      });
    }

    if (!session.endTime || !session.currentPhase) {
      return await interaction.reply({
        content: "⚠️ Session tracking hasn't started properly. Please restart your session.",
        ephemeral: false,
      });
    }

    const now = new Date();
    const remainingMs = new Date(session.endTime) - now;

    if (remainingMs <= 0) {
      return await interaction.reply({
        content: "⏳ Your current phase just ended. Wait for the next one to begin!",
        ephemeral: true,
      });
    }

    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);

    const phaseLabel = session.currentPhase === "break"
      ? "☕ Short Break"
      : session.currentPhase === "longBreak"
      ? "🌴 Long Break"
      : "📚 Study";

    await interaction.reply({
      content: `🔔 **${phaseLabel} session is active**

🕒 **Time Left:** \`${minutes}m ${seconds}s\`  
⏳ **Ends At:** <t:${Math.floor(new Date(session.endTime).getTime() / 1000)}:t>`,
      ephemeral: true,
    });

  } catch (error) {
    console.error("❌ Status check failed:", error);
    await interaction.reply({
      content: "⚠️ Something went wrong while checking your session status.",
      ephemeral: true,
    });
  }
}
