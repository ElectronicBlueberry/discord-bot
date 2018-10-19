const helper = require("./helperFunctions.js");

// Compare objects whitelist Parameters to find appropriate object
function findByWhitelist (array, channel)
{
	for (let i = 0; i < array.length; i++)
	{
		let whitelist = array[i].whitelist;

		if (whitelist != undefined && helper.searchArray(whitelist, channel))
		{
			return array[i];
		}
	}
}

// Compare objects blacklist Parameters to find appropriate object
function findByBlacklist (array, channel)
{
	for (let i = 0; i < array.length; i++)
	{
		let blacklist = array[i].blacklist;

		if (blacklist == undefined || !helper.searchArray(blacklist, channel))
		{
			return array[i];
		}
	}
}

module.exports = {
	// Add a command object that can later be called by a user
	addCommand: function (commandArray, command) {
		commandArray.push(command);
		console.log(`"${command.name}" command loaded. ${command.log}`);
	},

	// Add a messageProcessor, that scans and does stuff with messages
	addMessageProcessor: function (processorArray, processor) {
		processorArray.push(processor);
		console.log(`"${processor.name}" loaded. ${processor.log}`);
	},

	hasPrefix: function (message, prefix)
	{
		return message.content.substring(0, prefix.length) === prefix;
	},

	// Searches for a command in given array and runs it
	runCommand: function (commandArray, message, prefix)
	{
		if (commandArray == undefined)
		{
			return;
		}

		let arguments = message.content.substr(prefix.length).split(" ");   // remove prefix and split
		let name = arguments.shift();    // get command name

		let command = helper.searchArrayForName(commandArray, name);

		if (command == undefined)
		{
			return;
		}

		// Check for role
		if (command.role === "" || helper.searchMapForName(message.member.roles, command.role) )
		{
			command.run(message, arguments);
		}
	},

	// Searches for processor to run according to channel
	runMessageProcessor: function (processorArray, message)
	{
		if (processorArray == undefined)
		{
			return;
		}

		let processor = findByWhitelist(processorArray, message.channel.name);

		if (processor == undefined)
		{
			processor = findByBlacklist(processorArray, message.channel.name);
		}

		if (processor != undefined)
		{
			processor.run(message);
		}
	},

	channelCommands: [],
	dmCommands: [],
	messageProcessors: [],
	reactionProcessors: []
};