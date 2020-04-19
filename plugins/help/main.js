const settings = require('require-reload')('./settings.json');

var commands = [];

settings.commands.forEach((t) => {
	commands.push(
		{
			name: t,
			role: settings.role,
			run: (msg) => {
				msg.channel.send(settings.help_message);
			}
		}
	);
});

module.exports = {
	channelCommands: commands
};