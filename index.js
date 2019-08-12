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
	// Run DM commands
	if (message.channel.type === "dm")
	{
		// Ping Command
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

		// Channel Commands
		let member = await userdata.client.guilds.first().fetchMember(message.author.id);

		if (member != undefined) {
			handler.runCommand(loader.dmCommands, message, "", member);
		}
		
		return;
	}

	// Run Server commands
	if (handler.hasPrefix(message, config.prefix) && config.channel_command_whitelist.indexOf(message.channel.name) > -1)
	{
		handler.runCommand(loader.channelCommands, message, config.prefix, message.member);
		return;
	}

	// Process all other messages
	handler.runMessageProcessor(loader.messageProcessors, message);
});

userdata.client.on("messageReactionAdd", (messageReaction, user) => {
	// Do not react on self emissions
	if (messageReaction.me) return;

	handler.runMessageProcessor(loader.reactionProcessors, messageReaction, user);
});

// Trigger Reactions for uncached messages
// Code from https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/coding-guides/raw-events.md
userdata.client.on('raw', packet => {
    // We don't want this to run on unrelated packets
    if ('MESSAGE_REACTION_ADD' !== packet.t) return;
    // Grab the channel to check the message from
	const channel = userdata.client.channels.get(packet.d.channel_id);

	// Exit if channel is unknown
	if (!channel) return;

    // There's no need to emit if the message is cached, because the event will fire anyway for that
    if (channel.messages.has(packet.d.message_id)) return;
    // Since we have confirmed the message is not cached, let's fetch it
    channel.fetchMessage(packet.d.message_id).then(message => {
        // Emojis can have identifiers of name:id format, so we have to account for that case as well
        const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
        // This gives us the reaction we need to emit the event properly, in top of the message object
        const reaction = message.reactions.get(emoji);
        // Adds the currently reacting user to the reaction's users collection.
        if (reaction) reaction.users.set(packet.d.user_id, userdata.client.users.get(packet.d.user_id));
		// Check which type of event it is before emitting
		/*
        if (packet.t === 'MESSAGE_REACTION_ADD') {
            client.emit('messageReactionAdd', reaction, client.users.get(packet.d.user_id));
        }
        if (packet.t === 'MESSAGE_REACTION_REMOVE') {
            client.emit('messageReactionRemove', reaction, client.users.get(packet.d.user_id));
		}*/
		// Emit Reaction
		userdata.client.emit('messageReactionAdd', reaction, userdata.client.users.get(packet.d.user_id));
    });
});

userdata.client.on("guildMemberAdd", (member) => {
	loader.joinHandlers.forEach(element => {
		element.run(member);
	});
});

// Graceful shutdown
process.on("SIGINT" , () => shutdown());
process.on("SIGTERM", () => shutdown());

userdata.client.login(config.token);