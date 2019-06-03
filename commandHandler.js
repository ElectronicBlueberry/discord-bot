module.exports = {
	hasPrefix: function (message, prefix) {
		return message.content.substring(0, prefix.length) === prefix;
	},

	// Searches for a command in given array and runs it
	runCommand: function (commandArray, message, prefix, member)
	{
		if (commandArray == undefined) {
			return;
		}

		let arguments = [];

		if (message.content.length <= 128) {
			let str = message.content.substr(prefix.length);
			arguments = [].concat.apply([], str.split('"').map(function(v,i){
				return i%2 ? v : v.split(' ')
			})).filter(Boolean);   // remove prefix and split
		}

		let name = arguments.shift();    // get command name

		let command = commandArray.find(cmd => cmd.name === name);

		if (command == undefined) {
			return;
		}

		// Check for role
		if (command.role == undefined || command.role == "" || member.roles.get(command.roleId)) {
			command.run(message, arguments, member);
		}
	},

	// Searches for processor to run according to channel
	runMessageProcessor: function (processorArray, message)
	{
		if (processorArray == undefined) {
			return;
		}

		processorArray.forEach(element => {
			element.run(message);
		});
	}
};