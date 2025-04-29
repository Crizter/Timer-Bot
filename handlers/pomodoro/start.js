// handleStart.js
import { Session } from "../../models/sessions.models.js";
import { startPomodoroLoop } from "../../utils/pomodoroScheduler.js";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  }  from "discord.js";
export const handleStart = async (interaction, client) => {
  const userId = interaction.user.id;

  try {
    await interaction.deferReply();

    const existingSession = await Session.findOne({ userId, isActive: true });
    // if (existingSession) {
    //   return interaction.editReply({
    //     content: "⚠️ You already have an active Pomodoro session!",
    //   });
    // }
    
    if (existingSession) {
      return interaction.editReply({
        // content: "⚠️ You already have an active Pomodoro session!",
        content : "⚠️ You already have an active Pomodoro session!", ephermal : true
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

    await interaction.editReply({
      content: `⏳ Pomodoro session started!\nFocus for **${sessionData.workDuration} minutes**. Let’s get it! 🚀`,
      ephemeral: true
    });
    

// ✅ If this is triggered from a button, update the buttons (safely check)
if (interaction.isButton && interaction.message) {
    const updatedRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("start_session")
        .setLabel("▶️ Start Session")
        .setStyle(ButtonStyle.Success)
        .setDisabled(true),
  
      new ButtonBuilder()
        .setCustomId("stop_session")
        .setLabel("⛔ Stop")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(false),
  
      new ButtonBuilder()
        .setCustomId("skip_phase")
        .setLabel("⏭️ Skip Phase")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false)
    );
  
    try {
      await interaction.message.edit({
        components: [updatedRow],
      });
    } catch (err) {
      console.error("⚠️ Failed to update button states after start:", err);
    }
  }

    startPomodoroLoop(userId, client, interaction.channelId);

  } catch (err) {
    console.error("❌ Failed to start session:", err);
    await interaction.editReply({
      content: "❌ Something went wrong while starting your session.",
    });
  }
};
