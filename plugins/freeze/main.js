const settings = require('require-reload')('./settings.json');
const userdata = require("../../userdata.js");
const helper = require("../../helperFunctions.js");

var freezeRole, modRole;
var guild;

userdata.client.on("ready", async () => {
	guild = userdata.client.guilds.first();
	freezeRole = helper.getRoleByName(guild.roles, settings.user_role);
	modRole = helper.getRoleByName(guild.roles, settings.role);
});

var freezeChannel = {
	name: settings.freeze_command,
	role: settings.role,
	run: async (message) => {
		let channel = message.channel;
		if (!channel.manageable) {
			channel.send(settings.cannot_freeze);
			return;
		}

		try {
			await channel.overwritePermissions(freezeRole, {'SEND_MESSAGES' : false}, "channel frozen");
			await channel.overwritePermissions(modRole, {'SEND_MESSAGES' : true});

			channel.send(settings.freeze_message);
		} catch(e) {
			console.error(e);
		}
	}
};

var unfreezeChannel = {
	name: settings.unfreeze_command,
	role: settings.role,
	run: async (message) => {
		let channel = message.channel;
		if (!channel.manageable) {
			return;
		}

		try {
			await channel.overwritePermissions(freezeRole, {'SEND_MESSAGES' : true}, "channel unfrozen");

			channel.send(settings.unfreeze_message);
		} catch(e) {
			console.error(e);
		}
	}
};

module.exports = {
	channelCommands: [freezeChannel, unfreezeChannel]
};