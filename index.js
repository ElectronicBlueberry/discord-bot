const config = require("./config.json");    // Global bot settings and token
const discord = require("discord.js");      // framework for discord api

const client = new discord.Client();    // Client for communicating with discord api

// Commands
const handler = require("./commandHandler.js");
require("./commands/testCommand.js");

client.on("ready", async () => {
    console.log('${client.user.username} ready');
});

client.on("message", async (message) => {
    if (handler.isCommand(message, config.prefix))
    {
        handler.runCommand(message);
    }
});

client.login(config.token);