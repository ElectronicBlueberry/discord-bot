const userdata = require("../../userdata.js");
const settings = require("./settings.json.js");

function searchForUser(message, userName) {
	let user;

	if (userName.includes('#')) {
		user = message.guild.members.find(m => userName === m.user.tag);
	} else {
		user = message.guild.members.find(m => m.user.username === userName );

		if (user == undefined){
			user = message.guild.members.find(m => m.nickname === userName );
		}
	}

	return user;
}

let messageCount = {
	name: settings.command_count,
	role: settings.role,
	run: function (message, arguments) {
		let user;

		// Find User
		if (arguments.length == 0) {
			user = message.author;
		} else {
			let member = message.mentions.members.first();

			if (member != undefined) {
				user = member.user;
			} else {
				user = searchForUser(message, arguments[0]);
			}
		}

		// Failed to find
		if (user == undefined) {
			message.channel.send(settings.message_user_not_found);
			return;
		}

		// Send message Count
		let count = userdata.database.read( user.id, "messages");
		message.channel.send(`${count} ${settings.message_sucess}`);
	}
};

let messageRank = {
	name: settings.command_rank,
	role: settings.role,
	run: async function (message, arguments) {
		let userArray = userdata.database.getDataAsArray("messages");

		// Sort by message count
		userArray.sort((a, b) => {
			return b.key - a.key;
		});

		// Limit to 10 Users
		if (userArray.length > 10) {
			userArray.slice(0, 10);
		}

		// Build Top 10 List
		let responseString = `${settings.message_rank}\n`;

		for (let i = 0; i < userArray.length; i++)
		{
			var user = await message.client.fetchUser(userArray[i].primaryKey);
			responseString += ` ${i+1}.  ${user.username}: ${userArray[i].key}\n`;
		}

		message.channel.send(responseString);
	}
}

exports.channelCommands = [messageCount, messageRank];