const helper = require("./helperFunctions.js");

// Compare processors whitelist Parameters to find appropriate processor
function findProcessorByWhitelist (processorArray, channel)
{
	for (let i = 0; i < processorArray.length; i++)
	{
		let whitelist = processorArray[i].whitelist;

		if (whitelist != undefined && helper.searchArray(whitelist, channel))
		{
			return processorArray[i];
		}
	}
}

// Compare processors blacklist Parameters to find appropriate processor
function findProcessorByBlacklist (processorArray, channel)
{
	for (let i = 0; i < processorArray.length; i++)
	{
		let blacklist = processorArray[i].blacklist;

		if (blacklist == undefined || !helper.searchArray(blacklist, channel))
		{
			return processorArray[i];
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
		let processor = findProcessorByWhitelist(processorArray, message.channel.name);

		if (processor == undefined)
		{
			processor = findProcessorByBlacklist(processorArray, message.channel.name);
		}

		if (processor != undefined)
		{
			processor.run(message);
		}
	},

	channelCommands: [],
	dmCommands: [],
	messageProcessors: [],
};