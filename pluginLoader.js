const fs = require('fs');
const config = require("./config.json");
const userdata = require("./userdata.js");

// add role ids for all role elements
userdata.client.on("ready", () => {	
	let allCommands = [...exports.channelCommands, ...exports.dmCommands];

	allCommands.forEach(command => {
		command.roleId = userdata.client.guilds.first().roles.find(role => role.name === command.role).id;
	});
});

exports.channelCommands = [];
exports.messageProcessors = [];
exports.dmCommands = [];
exports.reactionProcessors = [];
exports.joinHandlers = [];

exports.scanPlugins = () => {
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
				exports.channelCommands = exports.channelCommands.concat(script.channelCommands);
			}

			if (script.dmCommands != undefined) {
				exports.dmCommands = exports.dmCommands.concat(script.dmCommands);
			}

			if (script.messageProcessors != undefined) {
				exports.messageProcessors = exports.messageProcessors.concat(script.messageProcessors);
			}

			if (script.dmCommands != undefined) {
				exports.reactionProcessors = exports.reactionProcessors.concat(script.reactionProcessors);
			}

			if (script.joinHandlers != undefined) {
				exports.joinHandlers = exports.script.joinHandlers.concat(script.joinHandlers);
			}
		}
	}

	console.log("=======================");
	console.log(` ==== Sucessfully loaded ${pluginList.length} Plugins ==== `);
};
