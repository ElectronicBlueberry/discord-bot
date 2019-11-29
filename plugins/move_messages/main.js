const settings = require('require-reload')('./settings.json');
const userdata = require("../../userdata.js");
const db = require("../../database/database.js");

const discord  = require("discord.js");

var guild;
var logChannel;
var database = new db.Database("MessageMover");

userdata.client.on("ready", async () => {
	guild = userdata.client.guilds.first();
	logChannel = guild.channels.find(e => e.name === settings.audit_log_channel);
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

	if (startId === endId) {
		return messages;
	}

	let fetching = true;
	let currentId = startId;
	while(fetching) {
		let newMessages = await channel.fetchMessages({ after: currentId });
		newMessages = newMessages.filter(m => {
			if (m.createdTimestamp === endTimestamp) {fetching = false;}
			return m.createdTimestamp <= endTimestamp;
		});

		newMessages = newMessages.sort((a, b) => {return a.createdTimestamp - b.createdTimestamp;});
		currentId = newMessages.last().id;
		messages = messages.concat(newMessages);
	}

	return messages;
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
		} else if (!message.attachments.first()) {
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

function sendResponse(targetChannel, count) {
	let attachment = new discord.Attachment("./img/banner.gif");
	let message = (count === 1) ? settings.move_single : settings.move_announcement;
	
	let sourceChannel = guild.channels.get( database.read("start", "channel"));

	message = message.replace(/TARGET/, targetChannel.toString());
	message = message.replace(/COUNT/, count.toString());

	sourceChannel.send(message, attachment);
}

async function checkReactionRole(reaction, user, validEmoji) {
	let member = await guild.fetchMember(user);

	// terminate if
	if (!member	// member isnt found
		|| reaction.message.guild.id !== guild.id // reaction isnt sent on server
		|| !validEmoji.includes(reaction.emoji.id)// reaction is from another emoji
	) {
		return false;
	}

	// remove emoji if user has wrong role
	// or channel is blacklisted
	if (!member.roles.get(markMessage.roleId)
		|| settings.blacklisted_channels.includes(reaction.message.channel.name)
	) {
		reaction.remove(user);
		return false;
	}

	return true;
}

var markMessage = {
	role: settings.role,
	roleId: 0,
	run: async (reaction, user) => {
		if (!(await checkReactionRole(reaction, user, settings.emoji))) return;

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
			
			sendResponse(message.channel, messages.size);
			message.delete();
		} catch(e) {
			console.log(e);
			message.channel.send(settings.fail_message);
		}
	}
}

var deleteMessages = {
	name: settings.delete_command,
	role: settings.role,
	run: async (message) => {
		try {
			let messages = await fetchSelectedMessages();
			let embeds = messages.map(m => {
				return embedFromMessage(m);
			});

			await logChannel.send(`${settings.log_message} <@${message.member.id}>`);

			for (let i = 0; i < embeds.length; i++) {
				await logChannel.send("", { embed: embeds[i] });
			}

			messages.tap(m => {
				m.delete();
			});

			message.delete();
		} catch (e) {
			console.log(e);
			logChannel.send(settings.delete_fail_message);
		}
	}
}

var deleteSingle = {
	role: settings.role,
	roleId: 0,
	run: async (reaction, user) => {
		try {
			if (!(await checkReactionRole(reaction, user, settings.delete_emoji))) return;

			let message = reaction.message;
			let embed = embedFromMessage(message);

			await logChannel.send(`${settings.log_message} <@${reaction.users.first().id}>`, embed);
			message.delete();
		} catch (e) {
			console.log(e);
			logChannel.send(settings.delete_fail_message);
		}
	}
}

var backupMessages = {
	name: settings.backup_command,
	role: settings.role,
	run: async (message) => {
		try {
			message.delete();

			let messages = await fetchSelectedMessages();

			// remove emojis
			let first = messages.first();
			let last = messages.last();

			let reactions = first.reactions.concat(last.reactions);
			reactions = reactions.filter(reaction => (reaction.emoji.id === settings.emoji[0] || reaction.emoji.id === settings.emoji[1]));
			reactions.tap(async reaction => {
				let users = await reaction.fetchUsers();
				users.tap(user => {
					reaction.remove(user);
				});
			});
			

			let embeds = messages.map(m => {
				return embedFromMessage(m);
			});

			await logChannel.send(`${settings.log_message_backup} <@${message.member.id}>`);

			for (let i = 0; i < embeds.length; i++) {
				await logChannel.send("", { embed: embeds[i] });
			}
		} catch (e) {
			console.log(e);
			logChannel.send(settings.backup_fail_message);
		}
	}
}

var backupSingle = {
	role: settings.role,
	roleId: 0,
	run: async (reaction, user) => {
		try {
			if (!(await checkReactionRole(reaction, user, settings.backup_emoji))) return;

			let message = reaction.message;
			let embed = embedFromMessage(message);

			reaction.remove(user);

			await logChannel.send(`${settings.log_message_backup} <@${reaction.users.first().id}>`, embed);
		} catch (e) {
			console.log(e);
			logChannel.send(settings.backup_fail_message);
		}
	}
}

module.exports = {
	reactionProcessors: [markMessage, deleteSingle, backupSingle],
	channelCommands: [moveMessages, deleteMessages, backupMessages]
}