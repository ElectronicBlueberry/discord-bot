// Compare objects whitelist Parameters to find appropriate objects
function findByWhitelist (array, channel)
{
	return array.filter( item => {
		if (item.whitelist != undefined) {
			return item.whitelist.find(c => c === channel);
		}
	});
}

// Compare objects blacklist Parameters to find appropriate objects
function findByBlacklist (array, channel)
{
	return array.filter( item => {
		if (item.blacklist != undefined) {
			return !(item.blacklist.find(c => c === channel));
		}
	});
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

		let command = commandArray.find(cmd => cmd.name === name);

		if (command == undefined)
		{
			return;
		}

		// Check for role
		if (command.role === "" || message.member.roles.find(role => role.name === command.role))
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

		let processors = [...findByWhitelist(processorArray, message.channel.name), ...findByBlacklist(processorArray, message.channel.name)];

		for (var processor of processors) {
			processor.run(message);
		}
	}
};