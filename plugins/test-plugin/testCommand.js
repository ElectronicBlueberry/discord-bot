var channelCommands = [];

channelCommands.push({
	name: "blub",
	role: "",
	log: 'test command that simply returns "blaaaa!"',
	run: (message, arguments) =>
	{
		message.channel.send("blaaaa!");
	}
});

channelCommands.push({
	name: "add",
	role: "mathematician",
	log: 'for "mathematician" role on server messages',
	run: (message, arguments) =>
	{
		if (arguments.length == 2)
		{
			message.channel.send(arguments[0] + " plus " + arguments[1] + " equals " + (parseInt(arguments[0]) + parseInt(arguments[1])) );
		}
		else
		{
			message.channel.send("I can only add two numbers! :frowning:");
		}
	}
});

module.exports = {
	channelCommands
};