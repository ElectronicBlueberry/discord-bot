const config   = require("./config.json"      ); // Global bot settings and token
const loader   = require("./pluginLoader.js"  );
const handler  = require("./commandHandler.js");
const userdata = require("./userdata.js"      );

// Plugins
loader.scanPlugins();

// Ping Command
var pingTimestamp = 0;

function recievePing(message) {
	pingTimestamp = message.createdTimestamp;
	message.channel.send("pong");
}

function sendPing(message) {
	message.channel.send( (message.createdTimestamp - pingTimestamp) + "ms");
}

function shutdown()
{
	console.log(`${userdata.client.user.username} shutting down`);
	userdata.database.save();
	process.exit(0);
}

// Main bot code
userdata.client.on("ready", () => {
	console.log(`${userdata.client.user.username} ready`);
});

userdata.client.on("message", async (message) => {
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
	if (handler.hasPrefix(message, config.prefix) && !(config.channel_command_blacklist.indexOf(message.channel.name) > -1))
	{
		handler.runCommand(loader.channelCommands, message, config.prefix);
		return;
	}

	// Process all other messages
	handler.runMessageProcessor(loader.messageProcessors, message);
});

userdata.client.on("messageReactionAdd", async (messageReaction, user) => {
	handler.runMessageProcessor(loader.reactionProcessors, messageReaction.message);
});

userdata.client.on("guildMemberAdd", (member) => {
	if (typeof(loader.joinHandler.run) == 'function') {
		loader.joinHandler.run(member);
	}
});

// Graceful shutdown
process.on("SIGINT" , () => shutdown());
process.on("SIGTERM", () => shutdown());

userdata.client.login(config.token);