const settings = require('require-reload')('./settings.json');
const userdata = require("../../userdata.js");

function find_channel(channelName) {
	let guild = userdata.client.guilds.first();
	return guild.channels.find(channel => channel.name === channelName);
}

function build_message(user) {
	let string = settings.greeting;
	string = string.replace(/USERNAME/gm, `<@${user.id}>`);
	string = string.replace(/CHANNEL#[^\s)\.,\/]*/gm, c => find_channel( c.substring( c.indexOf("#") + 1)).toString() );
	return string;
}

var newUserJoin = {
	run: (member) => {
		let channel = find_channel(settings.channel);
		let msg = build_message(member);

		setTimeout(() => {
			channel.send( msg);
		}, settings.delay);
	}
};

module.exports = {
	joinHandlers: [newUserJoin]
};