// commands/pomodoro/study.js
import { Session } from "../../models/sessions.models.js";
import { startPomodoroLoop } from "../../utils/pomodoroScheduler.js";

export async function handleStudy(interaction, client) {
  const userId = interaction.user.id;

  try {
    await interaction.deferReply({ ephemeral: true });

    const existingSession = await Session.findOne({ userId });

    const work = existingSession?.workDuration || 25;
    const shortBreak = existingSession?.breakDuration || 5;
    const longBreak = existingSession?.longBreakDuration || 10;
    const sessionGoal = existingSession?.sessionsBeforeLongBreak || 4;
    const maxSessions = existingSession?.maxSessions || sessionGoal;

    await Session.findOneAndUpdate(
      { userId },
      {
        workDuration: work,
        breakDuration: shortBreak,
        longBreakDuration: longBreak,
        sessionsBeforeLongBreak: sessionGoal,
        maxSessions: maxSessions,
        isActive: true,
        completedSessions: 0,
        currentPhase: "study",
        createdAt: new Date(),
      },
      { upsert: true }
    );

    await interaction.editReply(`📚 **Pomodoro Study Session Started!**

**⏱️ Work:** \`${work} min\`  
**☕ Break:** \`${shortBreak} min\`  
**🌴 Long Break:** \`${longBreak} min\`  
**🔁 Sessions before Long Break:** \`${sessionGoal}\`
**🎯 Max Sessions:** \`${maxSessions}\`

Stay focused and smash your goals 💪`);

    // Start the loop just like /pomodoro start
    startPomodoroLoop(userId, client);

  } catch (err) {
    console.error("❌ Error in /study:", err);
    await interaction.editReply("❌ Something went wrong while starting your study session.");
  }
}
