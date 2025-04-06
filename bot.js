import "dotenv/config";
import {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  Collection,
} from "discord.js";
import {
  data as pomodoroData,
  execute as pomodoroExecute,
} from "./commands/pomodoro.js";
import { connectToCluster } from "./database/db.js";
import { handleRest } from "./handlers/pomodoro/rest.js";
import { handleStart } from "./handlers/pomodoro/start.js";
import { handleSetup } from "./handlers/pomodoro/setup.js";
import { handleStopSession } from "./handlers/pomodoro/stop.js";
import { handleSkip } from "./handlers/pomodoro/skip.js";

// Create a new bot client
export const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Store commands
client.commands = new Collection();

// Define commands
const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
  },
  pomodoroData.toJSON(),
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
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
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

// Handle interactions
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction,client);
  } catch (error) {
    console.error(`❌ Error executing /${interaction.commandName}:`, error);
    // Updated: using flags to prevent ephemeral deprecation warning
    await interaction.reply({
      content: "❌ An error occurred while executing this command.",
      flags: 64, // 64 = ephemeral
    });
  }
});


client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case "start_session":
          return handleStart(interaction, client); // reuse your existing start logic
        case "stop_session":
          return handleStopSession(interaction); // custom stop handler
        case "skip_phase":
          return handleSkip(interaction); // custom skip logic
        
      }
    }
  });
  

const uri = process.env.DATABASE_URL;

// Start the bot
async function main() {
  await registerCommands();
  await connectToCluster(uri); // ✅ Await MongoDB connection before anything
  await client.login(process.env.TOKEN);

  // Catch unhandled exceptions
  process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
  });
}

main();
