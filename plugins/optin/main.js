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

function join_all(message)
{
	for (let i = 0; i < settings.channels.length; i++) {
		join_channel(message, settings.channels[i].name);
	}

	message.channel.send(settings.all_join_message);
}

function leave_all(message)
{
	for (let i = 0; i < settings.channels.length; i++) {
		leave_channel(message, settings.channels[i].name);
	}

	message.channel.send(settings.all_leave_message);
}

function find_channel(name)
{
	let channel = settings.channels.find(e => {
		return e.name === name;
	});

	return channel;
}

// attempts to leave channel and returns sucess
function leave_channel(message, channel)
{
	let c = find_channel(channel);
	let role = message.guild.roles.find(r => r.name === c.role);
	//let role = message.member.roles.find(r => r.name === c.role);

	if (role == undefined) {
		return false;
	}

	if (!c.optout) {
		if (!message.member.roles.has(role.id)) {
			return false;
		}

		message.member.removeRole(role);
	} else {
		message.member.addRole(role);
	}
	return true;
}

// attempts to join channel and returns sucess as 0: no such channel, 1: allready joined, 2: sucess
function join_channel(message, channel)
{
	let c = find_channel(channel);
	let role = message.guild.roles.find(r => r.name === c.role);

	if (role == undefined) {
		return 0;
	}

	if (c.optout) {
		message.member.removeRole(role);
	} else {
		if (message.member.roles.has(role)) {
			return 1;
		}

		message.member.addRole(role);
	}
	return 2;
}

var join = {
	name: settings.optin_command,
	role: settings.role,
	run: (message, arguments) => {

		let arg = arguments[0];

		if (arg === settings.all_argument) {
			join_all(message);
			return;
		}

		let sucess = 0;

		if (settings.channels.find(c => c.name === arg)) {
			sucess = join_channel(message, arg);
		}

		if (sucess == 0) {
			message.channel.send(settings.wrong_arguments + buildChannelString());
			return;
		}

		if (sucess == 1) {
			message.channel.send( settings.cant_join_message);
			return;
		}

		message.channel.send( arg + " " + settings.join_message);
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

		if (arg === settings.all_argument) {
			leave_all(message);
			return;
		}

		if ( settings.channels.find(c => c.name === arg) && leave_channel(message, arg)) {
			message.channel.send( arg + " " + settings.leave_message);
		} else {
			message.channel.send( settings.cant_leave_message);
		}
	}
};

module.exports = {
	channelCommands: [join, leave]
};