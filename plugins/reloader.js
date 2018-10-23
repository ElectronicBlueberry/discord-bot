const loader = require("../pluginLoader.js");

var rescan = {
	name: "rescan",
	role: "admin",
	run: (message, arguments) =>
	{
		message.channel.send("Lade Plugins neu");

		console.log("  ");
		loader.scanPlugins();

		message.channel.send("Fertig!");
	}
};

exports.channelCommands = [rescan];