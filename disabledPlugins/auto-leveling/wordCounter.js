const userdata = require("../../userdata.js"       );
const settingsFile = require('require-reload'          )("./settings.json");
const helper   = require("../../helperFunctions.js");

var settings = settingsFile;

// Change names to IDs
userdata.client.on("ready", async () => {
	settings.rank_ups.forEach((e) => {
		e.to   = helper.getIdByName(userdata.client.guilds.first().roles, e.to  );
		e.from = helper.getIdByName(userdata.client.guilds.first().roles, e.from);
	});
});

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

	message.member.addRole   (settings.rank_ups[rankIndex].to);
	message.member.removeRole(settings.rank_ups[rankIndex].from);
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

		if (message.member.roles.get(finalRole) == undefined)
		{
			settings.rank_ups.forEach((role, i) => {
				if (message.member.roles.get(role.from)) {
					promote(message, i, messageCount);
					return;
				}
			});
		}
	}
};

exports.messageProcessors = [countWords];