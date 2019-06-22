const settings = require('require-reload')('./settings.json');
const userdata = require("../../userdata.js");

var role;

var scanForUrl = {
	run: (message) => {
		if (/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gm.test(message.content)
			&& !(message.member.roles.get(role.id)))
		{


			let string = settings.message;
			string = string.replace(/USERNAME/gm, `<@${message.member.id}>`);

			message.delete()
				.then( msg => msg.channel.send(string) )
				.catch( console.error );
		}
	}
};

userdata.client.on("ready", () => {
	role = userdata.client.guilds.first().roles.find(role => role.name === settings.allowed_role);
	if (role === null) {
		console.log("WARINING!");
		console.log(`Role "${settings.allowed_role}" not found!`);
	}
});

module.exports = {
	messageProcessors: [scanForUrl]
}