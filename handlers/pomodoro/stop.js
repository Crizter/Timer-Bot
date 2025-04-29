// commands/pomodoro/stopsession.js
import { Session } from "../../models/sessions.models.js";
import { activeTimers } from "../../utils/pomodoroScheduler.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export async function handleStopSession(interaction) {
  const userId = interaction.user.id;

  try {
    const session = await Session.findOne({ userId, isActive: true });

    if (!session) {
      const replyOptions = {
        content: "❌ No active session to stop.",
        ephemeral: interaction.isButton() ? true : false,
      };

      return interaction.reply(replyOptions);
    }

    const timer = activeTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      activeTimers.delete(userId);
    }

    await Session.deleteOne({ _id: session._id });

    const replyMsg = 
  "⏹️ Your Pomodoro session has been stopped. Take care!\n**Note:** After you click the 'Stop' button, your current setup will be deleted. If you want to start a new one, you need to reset the Pomodoro by running `/pomodoro setup`. Otherwise, the default will be 25/5/15, and 4 sessions in total."


    if (interaction.isButton()) {
      await interaction.reply({ content: replyMsg, ephemeral: true });


      // 🔄 Update buttons if triggered from embed
      if (interaction.message) {
        const updatedRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("start_session")
            .setLabel("▶️ Start Session")
            .setStyle(ButtonStyle.Success)
            .setDisabled(false),

          new ButtonBuilder()
            .setCustomId("stop_session")
            .setLabel("⛔ Stop")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true),

          new ButtonBuilder()
            .setCustomId("skip_phase")
            .setLabel("⏭️ Skip Phase")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
        );

        await interaction.message.edit({ components: [updatedRow] });
      }
    } else {
      // from slash command
      await interaction.editReply({ content: replyMsg, ephemeral: true });

    }
  } catch (err) {
    console.error("❌ Failed to stop session:", err);
    const errorMsg = "⚠️ An error occurred while stopping your session.";

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(errorMsg);
    } else {
      await interaction.reply({ content: errorMsg, ephemeral: true });
    }
  }
}
