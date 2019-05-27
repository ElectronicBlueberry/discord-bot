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

let save = {
	name: "save",
	role: "admin",
	run: (message, arguments) => {
		const startTime = process.hrtime();
		message.channel.send("forcing database save");
		userdata.database.save();
		message.channel.send("database saved");
		const endTime = process.hrtime(startTime);
		message.channel.send(`it took ${(endTime[0] / 1000) + (endTime[1] / 1000000)} milliseconds`);
	}
}

exports.channelCommands = [ backup, save ];