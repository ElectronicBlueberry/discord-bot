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

		let args = [];

		let str = message.content.substr(prefix.length);
		args = [].concat.apply([], str.split('"').map(function(v,i){
			return i%2 ? v : v.split(' ')
		})).filter(Boolean);   // remove prefix and split

		args.forEach((element, index, array) => {
			array[index] = element.toLowerCase();
		});

		let name = args.shift();    // get command name

		let command = commandArray.find(cmd => cmd.name === name);

		if (command == undefined) {
			return;
		}

		// Check for role
		if (command.role == undefined || command.role == "" || member.roles.has(command.roleId)) {
			command.run(message, args, member);
		}
	},

	// Searches for processor to run according to channel
	runMessageProcessor: function (processorArray, message, user)
	{
		if (processorArray == undefined) {
			return;
		}

		processorArray.forEach(element => {
			element.run(message, user);
		});
	}
};