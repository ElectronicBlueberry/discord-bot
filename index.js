const config = require("./config.json");    // Global bot settings and token
const discord = require("discord.js");      // framework for discord api
const loader = require("./pluginLoader.js");
const handler = require("./commandHandler.js");

const client = new discord.Client();    // Client for communicating with discord api

// Plugins
loader.scanPlugins();

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
	console.log(`${client.user.username} ready`);
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

	// Run DM commands
	if (message.channel.type === "dm")
	{
		handler.runCommand(loader.dmCommands, message, "");
		return;
	}

	// Run Server commands
	if (handler.hasPrefix(message, config.prefix) && config.channel_command_blacklist.indexOf(message.channel.name) > -1)
	{
		handler.runCommand(loader.channelCommands, message, config.prefix);
		return;
	}

	// Process all other messages
	handler.runMessageProcessor(loader.messageProcessors, message);
});

client.on("messageReactionAdd", async (messageReaction, user) => {
	handler.runMessageProcessor(loader.reactionProcessors, messageReaction.message);
});

client.on("guildMemberAdd", (member) => {
	if (loader.joinHandler != undefined) {
		loader.joinHandler.run(member);
	}
});

client.login(config.token);