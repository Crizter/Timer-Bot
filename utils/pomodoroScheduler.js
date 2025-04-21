// utils/pomodoroScheduler.js
import { Session } from "../models/sessions.models.js";
import { getSessionEmbed } from "./getSessionEmbed.js";

export const activeTimers = new Map();

export async function startPomodoroLoop(userId, client, channelId) {
  let session = await Session.findOne({ userId, isActive: true });
  if (!session) return;

  const durations = {
    study: session.workDuration,
    break: session.breakDuration,
    longBreak: session.longBreakDuration,
  };

  const totalSessionsBeforeLongBreak = session.sessionsBeforeLongBreak;
  const maxSessions = session.maxSessions;

  const runPhase = async (phase) => {
    const duration = durations[phase];
    const newEndTime = new Date(Date.now() + duration * 60 * 1000);

    await Session.updateOne(
      { userId },
      { phase, endTime: newEndTime }
    );

    session.phase = phase;
    session.endTime = newEndTime;

    await remindUser(userId, phase, duration, client, channelId);

    return new Promise((resolve) => {
      const timeoutId = setTimeout(resolve, duration * 60 * 1000);
      activeTimers.set(userId, timeoutId);
    });
  };

  while (true) {
    session = await Session.findOne({ userId, isActive: true });
    if (!session || session.completedSessions >= maxSessions) break;

    const { phase, completedSessions } = session;

    // Handle each phase dynamically
    if (phase === "study") {
      await runPhase("study");
      await Session.updateOne({ userId }, { $inc: { completedSessions: 1 } });
      session.completedSessions += 1;
    } else if (phase === "break") {
      await runPhase("break");
    } else if (phase === "longBreak") {
      await runPhase("longBreak");
    } else {
      console.log("⚠️ Unknown phase. Defaulting to study.");
      await runPhase("study");
    }

    session = await Session.findOne({ userId, isActive: true });
    if (!session || session.completedSessions >= maxSessions) break;

    // Decide next phase
    const isLongBreakTime =
      session.completedSessions % totalSessionsBeforeLongBreak === 0;

    const nextPhase = session.phase === "study"
      ? isLongBreakTime
        ? "longBreak"
        : "break"
      : "study";

    await Session.updateOne({ userId }, { phase: nextPhase });
  }

  // Final cleanup
  await Session.updateOne({ userId }, { isActive: false });
  activeTimers.delete(userId);

  try {
    const channel = client.channels.cache.get(channelId);
    if (channel?.isTextBased()) {
      await channel.send(
        `🏁 <@${userId}> Your Pomodoro session is **complete**! Great job today 🎉`
      );
    }
  } catch (err) {
    console.error("❌ Failed to send completion message:", err);
  }

  console.log(`✅ Pomodoro complete for ${userId}`);
}

async function remindUser(userId, phase, duration, client, channelId) {
  try {
    const channel = client.channels.cache.get(channelId);
    if (!channel?.isTextBased()) return;

    const { embed, components } = await getSessionEmbed(userId);
    const message = `⏰ <@${userId}> ${
      phase === "study"
        ? `Time to focus!`
        : phase === "break"
        ? `Short break time!`
        : `Long break time!`
    }`;

    await channel.send({ content: message, embeds: [embed], components });
    console.log(`📣 Reminder sent for phase: ${phase}`);
  } catch (err) {
    console.error("❌ Reminder error:", err);
  }
}
