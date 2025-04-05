import { SlashCommandBuilder } from "discord.js";

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
        subcommand.setName("pomodoro-setup").setDescription("Configure your Pomodoro settings")
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
    );

export async function execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    console.log(`Executing command: /pomodoro ${subcommand}`);

    switch (subcommand) {
        case "start":
            await interaction.reply("⏳ Pomodoro session started! Stay focused.");
            break;
        case "rest":
            await interaction.reply("☕ Take a short break! Relax and recharge.");
            break;
        case "stopsession":
            await interaction.reply("⏹️ Pomodoro session stopped.");
            break;
        case "study":
            await interaction.reply("📚 Study session started! Let’s get to work.");
            break;
        case "timer":
            await interaction.reply("⏲️ Timer: X minutes remaining.");
            break;
        case "pomodoro-setup":
            const workDuration = interaction.options.getInteger("work");
            const breakDuration = interaction.options.getInteger("break");
            const longBreakDuration = interaction.options.getInteger("longbreak");
            const sessionsBeforeLongBreak = interaction.options.getInteger("sessions");

            await interaction.reply(
                `✅ **Pomodoro settings updated!**\n
                🔹 **Work:** ${workDuration} mins\n
                🔹 **Break:** ${breakDuration} mins\n
                🔹 **Long Break:** ${longBreakDuration} mins\n
                🔹 **Sessions before Long Break:** ${sessionsBeforeLongBreak}`
            );
            break;
        default:
            await interaction.reply("❌ Invalid Pomodoro command.");
    }
}


