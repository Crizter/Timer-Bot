// commands/pomodoro/rest.js
import { Session } from "../../models/sessions.models.js";

export async function handleRest(interaction) {
  const userId = interaction.user.id;

  try {
    await interaction.deferReply();

    const session = await Session.findOne({ userId, isActive: true });

    if (!session) {
      return interaction.editReply({
        content: "⚠️ You don't have an active Pomodoro session. Use `/start` to begin one.",
      });
    }

    // Determine break type
    const completed = session.completedSessions || 0;
    const sessionsBeforeLongBreak = session.sessionsBeforeLongBreak || 4;

    let breakTime;
    let isLongBreak = false;

    if (completed > 0 && completed % sessionsBeforeLongBreak === 0) {
      breakTime = session.longBreakDuration || 10;
      isLongBreak = true;
    } else {
      breakTime = session.breakDuration || 5;
    }

    await interaction.editReply(
      `${isLongBreak ? "🌴 Long Break!" : "☕ Short Break!"} Take ${breakTime} minutes to recharge.`
    );

    // ⏳ TODO: In future, set a countdown or DM the user when break ends

  } catch (err) {
    console.error("❌ Error in handleRest:", err);
    await interaction.editReply("❌ Something went wrong while starting your break.");
  }
}
