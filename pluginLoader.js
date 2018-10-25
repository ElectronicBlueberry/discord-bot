const fs = require('fs');
const config = require("./config.json");
const userdata = require("./userdata.js");

// add role ids for all role elements
userdata.client.on("ready", () => {	
	let allCommands = [exports.channelCommands, exports.dmCommands];

	mAndP.forEach(e => {
		e.forEach(command => {
			command.roleId = clinet.guilds.first().roles.find(role => role.name === command.role);
		});
	});
});

module.exports = {

	scanPlugins: () => {
		module.exports.channelCommands = [];
		module.exports.messageProcessors = [];
		module.exports.dmCommands = [];
		module.exports.reactionProcessors = [];
		module.exports.joinHandler = {};

		console.log("Searching for Plugins...");

		const files = fs.readdirSync(`./${config.plugin_folder}`);
		let pluginList = [];

		// Scan Folder for plugins
		for (let i = 0; i < files.length; i++)
		{
			if (files[i].endsWith(config.plugin_suffix))
			{
				pluginList.push(files[i]);
			}
		}

		if (pluginList.length === 0)
		{
			return;
		}

		// Load all Plugins
		for (let i = 0; i < pluginList.length; i++)
		{
			let content = fs.readFileSync(`./${config.plugin_folder}/${pluginList[i]}`);
			let parameters = JSON.parse(content);

			console.log("=======================");
			console.log(`Loading Plugin "${parameters.name}"`);
			console.log(`${parameters.log}`);

			// Go through all files and load various command arrays
			for (let a = 0; a < parameters.files.length; a++)
			{
				let script = require('require-reload')(`./${config.plugin_folder}/${parameters.files[a]}`);

				if (script.channelCommands != undefined) {
					module.exports.channelCommands = module.exports.channelCommands.concat(script.channelCommands);
				}

				if (script.dmCommands != undefined) {
					module.exports.dmCommands = module.exports.dmCommands.concat(script.dmCommands);
				}

				if (script.messageProcessors != undefined) {
					module.exports.messageProcessors = module.exports.messageProcessors.concat(script.messageProcessors);
				}

				if (script.dmCommands != undefined) {
					module.exports.reactionProcessors = module.exports.reactionProcessors.concat(script.reactionProcessors);
				}

				if (script.joinHandler != undefined) {
					module.exports.joinHandler = script.joinHandler;
				}
			}
		}

		console.log("=======================");
		console.log(` ==== Sucessfully loaded ${pluginList.length} Plugins ==== `);
	},

	channelCommands: [],
	dmCommands: [],
	messageProcessors: [],
	reactionProcessors: [],
	joinHandler: {}
};
