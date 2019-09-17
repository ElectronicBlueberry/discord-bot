const settings = require('require-reload')('./settings.json');
const userdata = require("../../userdata.js");
const db = require("../../database/database.js");

const discord  = require("discord.js");

var guild;
var database = new db.Database("MessageMover");

userdata.client.on("ready", async () => {
	guild = userdata.client.guilds.first();
});

function setMessage(message, pos) {
	let key = (pos === 0) ? "start" : "end";
	database.write(key, "id", message.id);
	database.write(key, "timestamp", message.createdTimestamp);
	database.write(key, "channel", message.channel.id);
}

// Test whether start and end marks are in the same channel
function testChannelCuncurrency() {
	let startChannel = database.read("start", "channel");
	let endChannel = database.read("end", "channel");

	return startChannel === endChannel;
}

// Test whether end mark is after start mark
function testTimeCuncurrency() {
	let startTime = database.read("start", "timestamp");
	let endTime = database.read("end", "timestamp");

	return startTime <= endTime;
}

// Attempt old reaction removal
async function removeOldReaction(pos) {
	let key = (pos === 0) ? "start" : "end";
	try {
		let channelId = database.read(key, "channel");
		let messageId = database.read(key, "id");
		let channel = guild.channels.get(channelId);
		let message = await channel.fetchMessage(messageId);

		let reactions = message.reactions.filter(reaction => reaction.emoji.id === settings.emoji[pos] );

		reactions.tap(async reaction => {
			let users = await reaction.fetchUsers();
			users.tap(user => {
				reaction.remove(user);
			});
		});
	} catch {}
}

// Attempt to post reaction
async function postReaction(pos) {
	let sourceKey = (pos === 0) ? "start" : "end";
	try {
		let channelId = database.read(sourceKey, "channel");
		let channel = guild.channels.get(channelId);
		let messageId = database.read(sourceKey, "id");
		let message = await channel.fetchMessage(messageId);

		message.react(settings.emoji[(pos === 0) ? 1 : 0]);
	} catch(error) {
		console.log(error);
	}
}

// Math other marker to pos marker
function matchMessage(pos) {
	let sourceKey = (pos === 0) ? "start" : "end";
	let targetPos = (pos === 0) ? 1 : 0;

	let targetKey = (targetPos === 0) ? "start" : "end";

	removeOldReaction(targetPos);
	postReaction(pos);

	// Match database entry
	database.write(targetKey, "id",
		database.read(sourceKey, "id")
	);
	database.write(targetKey, "timestamp",
		database.read(sourceKey, "timestamp")
	);
	database.write(targetKey, "channel",
		database.read(sourceKey, "channel")
	);
}

async function fetchSelectedMessages() {
	let channelId = database.read("start", "channel");
	let channel = guild.channels.get(channelId);
	let startId = database.read("start", "id");
	let endId = database.read("end", "id");
	let endTimestamp = database.read("end", "timestamp");

	let message = await channel.fetchMessage(startId);
	let messages = new discord.Collection();

	messages.set(message.id, message);

	if (startId !== endId) {
		messages = messages.concat(
			await channel.fetchMessages({ after: startId })
		);
	}

	messages = messages.filter(m => m.createdTimestamp <= endTimestamp);

	return messages.sort((a, b) => {return a.createdTimestamp - b.createdTimestamp;});
}

function embedFromMessage(message) {
	let embed = new discord.RichEmbed();

	if (message.author.id === userdata.client.user.id && message.embeds.length === 1) {
		embed = message.embeds[0];
	} else {
		if (message.member !== null) {
			embed = embed
				.setAuthor(message.member.displayName, message.author.avatarURL)
				.setColor(message.member.displayColor);
		} else if (message.author !== null) {
			embed = embed
				.setAuthor(message.author.username, message.author.avatarURL)
				.setColor('#ffffff');
		} else {
			embed = embed
				.setAuthor("Unbekannte Person");
		}

		if (message.content) {
			embed = embed
				.setDescription(message.content);
		} else {
			embed = embed
				.setDescription("Gelöschte Nachricht");
		}

		embed = embed.setTimestamp(message.createdTimestamp);
	}

	let attachment = message.attachments.first();

	if (attachment && (attachment.width || attachment.height)) {
		embed = embed
			.attachFile(attachment.url)
			.setImage(`attachment://${attachment.filename}`)
	}

	return embed;
}

function sendResponse(targetChannel) {
	let attachment = new discord.Attachment("./img/banner.gif");
	let message = settings.move_announcement;
	
	let sourceChannel = guild.channels.get( database.read("start", "channel"));

	message = message.replace(/TARGET/, targetChannel.toString() );

	sourceChannel.send(message, attachment);
}

var markMessage = {
	role: settings.role,
	roleId: 0,
	run: async (reaction, user) => {
		let member = await guild.fetchMember(user);

		// terminate if
		if (!member	// member isnt found
			|| reaction.message.guild.id !== guild.id // reaction isnt sent on server
			|| !settings.emoji.includes(reaction.emoji.id)// reaction is from another emoji
		) {
			return;
		}

		// remove emoji if user has wrong role
		// or channel is blacklisted
		if (!member.roles.get(markMessage.roleId)
			|| settings.blacklisted_channels.includes(reaction.message.channel.name)
		) {
			reaction.remove(user);
			return;
		}

		// Check if emoji, is start or stop emoji
		let pos = settings.emoji.indexOf(reaction.emoji.id);

		removeOldReaction(pos);

		// Write postion to database
		setMessage(reaction.message, pos);

		if (!testChannelCuncurrency() || !testTimeCuncurrency()) {
			matchMessage(pos);
		}

		database.save();
	}
}

var moveMessages = {
	name: settings.move_command,
	role: settings.role,
	run: async (message) => {
		try {
			let messages = await fetchSelectedMessages();
			let embeds = messages.map(m => {
				return embedFromMessage(m);
			});

			for (let i = 0; i < embeds.length; i++) {
				await message.channel.send("", { embed: embeds[i] });
			}

			messages.tap(m => {
				m.delete();
			});
			
			sendResponse(message.channel);
			message.delete();
		} catch(e) {
			console.log(e);
			message.channel.send(settings.fail_message);
		}
	}
}

module.exports = {
	reactionProcessors: [markMessage],
	channelCommands: [moveMessages]
}