const settings = require('require-reload')('./settings.json');

function buildChannelString()
{
	var message = "";

	for (let i = 0; i < settings.channels.length; i++)
	{
		message += "\n";
		message += settings.channels[i].name;
	}

	return message;
}

var join = {
	name: settings.optin_command,
	role: settings.role,
	run: (message, arguments) => {

		let arg = arguments[0];
		let role = message.guild.roles.find(r => r.name === arg);

		if (role == undefined) {
			message.channel.send(settings.wrong_arguments + buildChannelString());
			return;
		}

		if (message.member.roles.find(r => r == role)) {
			message.channel.send( settings.cant_join_message);
			return;
		}

		message.member.addRole(role);
		message.channel.send( role.name + " " + settings.join_message);
	}
};

var leave = {
	name: settings.optout_command,
	role: settings.role,
	run: (message, arguments) => {

		if (arguments.length != 1) {
			message.channel.send(settings.wrong_arguments + buildChannelString());
			return;
		}

		let arg = arguments[0];
		let role = message.member.roles.find(r => r.name === arg);

		if (role == undefined){
			message.channel.send( settings.cant_leave_message);
			return;
		}

		message.member.removeRole(role);
		message.channel.send( role.name + " " + settings.leave_message);
	}
};

module.exports = {
	channelCommands: [join, leave]
};