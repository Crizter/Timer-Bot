import { Session } from "../models/sessions.models.js";

export const activeTimers = new Map();

export async function startPomodoroLoop(userId, client) {
  const session = await Session.findOne({ userId, isActive: true });
  if (!session) return;

  const durations = {
    study: session.workDuration,
    break: session.breakDuration,
    longBreak: session.longBreakDuration,
  };

  const totalSessions = session.sessionsBeforeLongBreak;
  let completedSessionPairs = 0;

  console.log(`▶️ Pomodoro started for ${userId}`);
  console.log(`⏱️ Durations — Work: ${durations.study}m, Break: ${durations.break}m, Long Break: ${durations.longBreak}m, Sessions: ${totalSessions}`);

  const runPhase = async (phase, duration) => {
    console.log(`🔁 Starting ${phase} phase for ${duration} minute(s)...`);

    await Session.updateOne(
      { userId },
      {
        currentPhase: phase,
        endTime: new Date(Date.now() + duration * 60 * 1000),
      }
    );

    await remindUser(userId, phase, duration, client);

    return new Promise((resolve) => {
      const timeoutId = setTimeout(resolve, duration * 60 * 1000);
      activeTimers.set(userId, timeoutId);
    });
  };

  const loop = async () => {
    while (completedSessionPairs < totalSessions) {
      await runPhase("study", durations.study);
      await runPhase("break", durations.break);
      completedSessionPairs += 1;

      console.log(`✅ Session ${completedSessionPairs} of ${totalSessions} completed`);
    }

    await runPhase("longBreak", durations.longBreak);

    await Session.updateOne({ userId }, { isActive: false });
    activeTimers.delete(userId);

    console.log(`🏁 Pomodoro complete for ${userId}. Session ended.`);
  };

  loop();
}

async function remindUser(userId, phase, duration, client) {
  try {
    const guilds = client.guilds.cache;
    for (const [, guild] of guilds) {
      const member = await guild.members.fetch(userId).catch(() => null);
      if (!member) continue;

      const message = `⏰ <@${userId}> ${
        phase === "study"
          ? `Study session started! Focus for ${duration} min.`
          : phase === "break"
          ? `Short break! Chill for ${duration} min.`
          : `Long break started! Relax for ${duration} min.`
      }`;

      const voiceChannel = member.voice?.channel;
      const textChannel =
        guild.systemChannel || guild.channels.cache.find((ch) => ch.isTextBased() && ch.viewable);

      if (voiceChannel?.sendable) {
        voiceChannel.send(message).catch(() => {});
        console.log(`📣 Sent reminder in voice channel for phase: ${phase}`);
      } else if (textChannel) {
        textChannel.send(message).catch(() => {});
        console.log(`📣 Sent reminder in text channel for phase: ${phase}`);
      } else {
        console.log(`⚠️ No channel found to send reminder for ${userId}`);
      }

      break;
    }
  } catch (err) {
    console.error("❌ Reminder error:", err);
  }
}
