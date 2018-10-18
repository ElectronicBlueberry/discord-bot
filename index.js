const config = require("./config.json");    // Global bot settings and token
const discord = require("discord.js");      // framework for discord api

const client = new discord.Client();    // Client for communicating with discord api

// Commands
const handler = require("./commandHandler.js");
require("./commands/testCommand.js");

// Ping Command
var pingTimestamp = 0;

function recievePing(message)
{
    pingTimestamp = message.createdTimestamp;
    message.channel.send("pong");
}

function sendPing(message)
{
    message.channel.send( (message.createdTimestamp - pingTimestamp) + "ms");
}

// Main bot code
client.on("ready", async () => {
    console.log(client.user.username +  ' ready');
});

client.on("message", async (message) => {
    if (message.author.bot)
    {
        if (message.content === "pong")
        {
            sendPing(message);
        }
        return;
    }

    if (message.content === config.prefix + "ping")
    {
        recievePing(message);
        return;
    }

    if (handler.hasPrefix(message, config.prefix))
    {
        handler.runCommand(handler.channelCommands, message, config.prefix);
        return;
    }
});

client.login(config.token);