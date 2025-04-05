import "dotenv/config";
import { Client, Events, GatewayIntentBits, REST, Routes, Collection } from "discord.js";
import { data as pomodoroData, execute as pomodoroExecute } from "./commands/pomodoro.js"; // Import Pomodoro command
import { connectToCluster } from "./database/db.js";
// Create a new bot client
export const client = new Client({
    intents: [GatewayIntentBits.Guilds], // No need for message intents with slash commands
});

// Store commands
client.commands = new Collection();

// Define commands
const commands = [
    {
        name: "ping",
        description: "Replies with Pong!",
    },
    pomodoroData.toJSON(), // Add Pomodoro command
];

// Add commands to collection
client.commands.set("ping", {
    execute: async (interaction) => {
        await interaction.reply("🏓 Pong!");
    },
});
client.commands.set("pomodoro", { execute: pomodoroExecute });

// Initialize REST API
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// Register the slash commands
async function registerCommands() {
    try {
        console.log("🚀 Registering slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log("✅ Slash commands registered successfully!");
    } catch (error) {
        console.error("❌ Error registering slash commands:", error);
    }
}

// When the bot is ready
client.once(Events.ClientReady, () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// Handle interactions (slash commands)
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (command) {
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`❌ Error executing ${interaction.commandName}:`, error);
            await interaction.reply({ content: "❌ An error occurred while executing this command.", ephemeral: true });
        }
    }
});

const uri = process.env.DATABASE_URL ; 



// Start the bot
async function main() {
    await registerCommands();
    connectToCluster(uri) ; 
    client.login(process.env.TOKEN).catch((error) => {
        console.error("❌ Failed to log in:", error);
    });


    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
        console.error("❌ Uncaught Exception:", error);
    });
}

main();
