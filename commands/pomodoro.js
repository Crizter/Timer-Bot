import { SlashCommandBuilder } from "discord.js";
import { handleStart } from "../handlers/pomodoro/start.js";
import { handleStudy } from "../handlers/pomodoro/study.js";
import { handleStopSession } from "../handlers/pomodoro/stop.js";
import { handleSetup } from "../handlers/pomodoro/setup.js";
import { handleStatus } from "../handlers/pomodoro/status.js";
import { handleRest } from "../handlers/pomodoro/rest.js";
import { Client } from "discord.js";

// const client = new Client({
//     intents: ["Guilds"],
// });
export const data = new SlashCommandBuilder()
    .setName("pomodoro") // 🔹 Add main command name
    .setDescription("Manage your Pomodoro sessions.")
    
    .addSubcommand(subcommand =>
        subcommand.setName("start").setDescription("Start a Pomodoro session")
    )
    .addSubcommand(subcommand =>
        subcommand.setName("rest").setDescription("Take a short break")
    )
    .addSubcommand(subcommand =>
        subcommand.setName("stopsession").setDescription("Stop the session")
    )
    .addSubcommand(subcommand =>
        subcommand.setName("study").setDescription("Describe your study session")
    )
    .addSubcommand(subcommand =>
        subcommand.setName("timer").setDescription("Start the timer")
    )
    .addSubcommand(subcommand => 
        subcommand.setName("setup").setDescription("Configure your Pomodoro settings")
        .addIntegerOption(option =>
            option.setName("work")
                .setDescription("Set work duration in minutes")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("break")
                .setDescription("Set break duration in minutes")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("longbreak")
                .setDescription("Set long break duration in minutes")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("sessions")
                .setDescription("Set number of sessions before long break")
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName("max-sessions")
                .setDescription("Set the maximum number of sessions, if not set then sessions will be counted as max sessions.")
                .setRequired(false)
        )
        
    )
    .addSubcommand(subcommand =>
        subcommand.setName("status").setDescription("Check your current Pomodoro status")
      )

export async function execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();
    console.log(`Executing command: /pomodoro ${subcommand}`);

    switch (subcommand) {
        case "start":
            await handleStart(interaction,client);
            break;
        case "rest":
            await handleRest(interaction);
            break;
        case "stopsession":
            await handleStopSession(interaction);
            break;
        case "study":
            await handleStudy(interaction);
            break;
        // case "timer":
        //     await interaction.reply("⏲️ Timer: X minutes remaining.");
        //     break;
        case "setup":
            const workDuration = interaction.options.getInteger("work");
            const breakDuration = interaction.options.getInteger("break");
            const longBreakDuration = interaction.options.getInteger("longbreak");
            const sessionsBeforeLongBreak = interaction.options.getInteger("sessions");

           await handleSetup(interaction, {
                workDuration,
                breakDuration,
                longBreakDuration,
                sessionsBeforeLongBreak
            }); 
            break;
            case "status":
                await handleStatus(interaction);
                break;
           
        default:
            await interaction.reply("❌ Invalid Pomodoro command.");
    }
}


