// commands/pomodoro/setup.js
import { Session } from "../../models/sessions.models.js";

export async function handleSetup(interaction) {
  const work = interaction.options.getInteger("work");
  const shortBreak = interaction.options.getInteger("break");
  const longBreak = interaction.options.getInteger("longbreak");
  const sessions = interaction.options.getInteger("sessions");
  const maxSessions = interaction.options.getInteger("max-sessions") ?? sessions;

  try {
    await interaction.deferReply({ ephemeral: false });

    // 🚫 Validate logic: maxSessions must be ≥ sessions
    if (maxSessions < sessions) {
      return interaction.editReply(
        "⚠️ `max-sessions` must be greater than or equal to `sessions` (sessions before long break)."
      );
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
        createdAt: new Date(), // TTL-based deletion after 10 hours
      },
      { upsert: true, new: true }
    );

    await interaction.editReply(
      `✅ **This is your Pomodoro session setup**
      
**⏱️ Work:** \`${work} min\`
**☕ Break:** \`${shortBreak} min\`
**🌴 Long Break:** \`${longBreak} min\`
**🔁 Sessions Before Long Break:** \`${sessions}\`
**🎯 Max Sessions:** \`${maxSessions}\`
      
You can now run \`/pomodoro start\` to begin.`
    );
  } catch (err) {
    console.error("❌ Pomodoro setup failed:", err);
    await interaction.editReply("❌ Failed to save your Pomodoro setup. Please try again.");
  }
}
