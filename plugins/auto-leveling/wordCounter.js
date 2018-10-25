const userdata = require("../../userdata.js");
const settings = require("./settings.json")

var finalRole = settings.rank_ups[settings.rank_ups.length - 1].to;
var MS_TO_MIN = 1 / 60000;

async function promote(message, rankIndex, messageCount)
{
	if (messageCount < settings.rank_ups[rankIndex].message_count) {
		return;
	}

	if ( (message.createdTimestamp - message.member.joinedTimestamp) * MS_TO_MIN < settings.rank_ups[rankIndex].time_count) {
		return;
	}

	let roleIdTo   = message.guild.roles.find(r => r.name === settings.rank_ups[rankIndex].to  ).id;
	let roleIdFrom = message.guild.roles.find(r => r.name === settings.rank_ups[rankIndex].from).id;

	message.member.addRole   (roleIdTo  );
	message.member.removeRole(roleIdFrom);
}

let countWords = {
	name: "Wort Counter",
	run: function(message) {
		let user = message.author.id;
		let messageCount = userdata.database.read(user, "messages");

		if (messageCount == undefined) {
			messageCount = 0;
		}

		messageCount++;
		userdata.database.write(user, "messages", messageCount);

		if (message.member.roles.find(r => r.name === finalRole) == undefined)
		{
			settings.rank_ups.forEach((role, i) => {
				if (message.member.roles.find(r => r.name === role.from)) {
					promote(message, i, messageCount);
					return;
				}
			});
		}
	}
};

exports.messageProcessors = [countWords];