var haha = {
	name: 'haha',
	whitelist: ["general"],
	run: function (message) {
		message.channel.send("haha");
	}
};

var hoho = {
	name: "hoho",
	blacklist: ["test"],
	run: function (message) {
		message.channel.send("hoho");
	}
};

module.exports = {
	messageProcessors: [haha, hoho]
};