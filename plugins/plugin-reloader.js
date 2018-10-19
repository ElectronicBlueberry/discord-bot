const loader = require("../pluginLoader.js");

var channelCommands = [{
	name: "rescanplugins",
	role: "admin",
	run: (message, arguments) =>
	{
		message.channel.send("Lade Plugins neu");

		console.log("  ");

		loader.scanPlugins();
		loader.loadCommands();

		message.channel.send("Fertig!");
	}
}];

module.exports = {
	channelCommands
};