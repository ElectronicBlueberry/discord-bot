const settings = require('require-reload')('./settings.json');
const userdata = require("../../userdata.js");
const helper = require("../../helperFunctions.js");
const assert = require('assert');

var role;

var channels = [];

userdata.client.on("ready", async () => {
	settings.channels.forEach(element => {
		let id = helper.getIdByName(userdata.client.guilds.first().channels, element);
		assert(id, `no_link plugin: channel with name ${element} not found`);
		channels.push(id);
	});
});


function replaceUsername(message, string) {
	return string.replace(/USERNAME/gm, `<@${message.member.id}>`);
}

function clearRespsone(message) {
	setTimeout(m => m.delete(), settings.linger, message);
}

async function respond(message, string) {
	string = replaceUsername(message, string);

	try {
		let deleted = await message.delete();
		let response = await deleted.channel.send(string);
		clearRespsone(response);
	} catch {
		console.error();
	}
	
}

function getTimer(id) {
	return setTimeout((id) => {
		spamData[id].count = 0;
	}, settings.autobann.timeout, id);
}

// Data on all potentail message spams
var spamData = {};

var scanForUrl = {
	run: (message) => {
		if (channels.indexOf(message.channel.id) === -1) {
			return;
		}

		if (/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gm.test(message.content)
			&& !(message.member.roles.get(role.id)))
		{
			let id = message.member.id;

			// If this is the users first link post attempt
			if (!spamData[id] || spamData[id]["count"] == 0) {
				spamData[id] = {count: 1};
				
				let timeout = getTimer(id);
				spamData[id]["timeoutId"] = timeout;

				// first warning message
				respond(message, settings.message);
			} else {
				let count = spamData[id]["count"];
				count += 1;
				spamData[id]["count"] = count;

				// Remove old timer
				clearTimeout(spamData[id]["timeoutId"]);

				// Check if message limit is reached
				// Not yet reached
				if (count < settings.autobann.count) {		
					// reset timer
					spamData[id]["timeoutId"] = getTimer(id);

					// warn
					respond(message, settings.autobann.message);
				} else {
					// Ban, and delte messages from past Day
					message.member.ban(1);
					
					delete spamData[id];
				}
			}
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