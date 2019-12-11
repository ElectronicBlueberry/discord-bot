const settings = require('require-reload')('./settings.json');
const discord  = require("discord.js");

var bulk = {
	name: settings.bulk_command,
	role: settings.role,
	run: async (message, arguments) => {
		let rName = arguments[0];
		let operation = arguments[1];
		let perm = arguments[2].toUpperCase();
		if (!operation || !rName) {
			message.channel.send(settings.noArgs);
			return;
		}		

		let role = message.guild.roles.find(r => r.name.toLowerCase() === rName);
		if (!role) {
			message.channel.send(settings.noRole);
			return;
		}

		let overwrite = {};

		switch (operation) {
			case settings.allow:
				overwrite[perm] = true;
				break;
		
			case settings.deny:
				overwrite[perm] = false;
				break;

			case settings.delete:
				overwrite[perm] = null;
				break;

			default:
				message.channel.send(settings.noOp);
				return;
		}

		message.guild.channels.forEach(c => {
			c.overwritePermissions(role, overwrite);
		});		

		message.channel.send(settings.sucess);
	}
};

module.exports = {
	channelCommands: [bulk]
};