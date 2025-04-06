import { Session } from "../../models/sessions.models.js";

export async function handleStatus(interaction) {
  try {
    const userId = interaction.user.id;
    const session = await Session.findOne({ userId });

    if (!session || !session.isActive) {
      return await interaction.reply({
        content: "❌ You don’t have any active Pomodoro session. Use `/pomodoro start` to begin one!",
        ephemeral: true,
      });
    }

    if (!session.startedAt || !session.duration) {
      return await interaction.reply({
        content: "⚠️ Session tracking hasn't started properly. Please restart your session.",
        ephemeral: true,
      });
    }

    const now = new Date();
    const elapsed = Math.floor((now - session.startedAt) / 1000); // in seconds
    const total = session.duration * 60; // session duration is in minutes
    const remaining = Math.max(total - elapsed, 0); // never go negative

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    const sessionType = session.type === "break" ? "☕ Break" : "📚 Study";

    await interaction.reply({
      content: `🔔 **${sessionType} session is active**

🕒 **Time Left:** \`${minutes}m ${seconds}s\`  
🧭 **Started At:** <t:${Math.floor(session.startedAt.getTime() / 1000)}:t>`,
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
