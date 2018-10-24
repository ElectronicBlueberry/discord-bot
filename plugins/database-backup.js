const userdata = require("../userdata.js");
const fs = require('fs');

let backup = {
	name: "backup",
	role: "admin",
	run: (message, arguments) => {
		fs.copyFile(`${userdata.database.path}`,
		`${userdata.database.path}_backup_${message.createdAt.getFullYear()}.${message.createdAt.getMonth() + 1}.${message.createdAt.getDate()}.${message.createdAt.getHours()}.${message.createdAt.getMinutes()}`,
		(err) => {
			if (err == undefined) {
				message.channel.send("database backed-up");
			} else {
				message.channel.send( err.message );
			}
		});
	}
};

exports.channelCommands = [ backup ];