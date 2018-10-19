const fs = require('fs');
const config = require("./config.json");
const handler = require("./commandHandler.js");

var channelCommands = [];
var messageProcessors = [];
var dmCommands = [];
var reactionProcessors = [];

module.exports = {

	scanPlugins: () => {
		channelCommands = [];
		messageProcessors = [];
		dmCommands = [];
		reactionProcessors = [];

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
					channelCommands = channelCommands.concat(script.channelCommands);
				}

				if (script.dmCommands != undefined) {
					dmCommands = dmCommands.concat(script.dmCommands);
				}

				if (script.messageProcessors != undefined) {
					messageProcessors = messageProcessors.concat(script.messageProcessors);
				}

				if (script.dmCommands != undefined) {
					reactionProcessors = reactionProcessors.concat(script.reactionProcessors);
				}
			}
		}

		console.log("=======================");
		console.log(` ==== Sucessfully loaded ${pluginList.length} Plugins ==== `);
	},

	// replaces Handler Commands
	loadCommands: () => {
		handler.channelCommands = channelCommands;
		handler.dmCommands = dmCommands;
		handler.messageProcessors = messageProcessors;
		handler.reactionProcessors = reactionProcessors;
	}
};
