const userdata = require("../../userdata.js");

var countWords = {
	name: "Wort Counter",
	blacklist: [""],
	run: function(message) {
		let user = message.author.id;
		let messageCount = userdata.database.read(user, "messages");

		if (messageCount == undefined) {
			messageCount = 0;
		}

		messageCount++;

		userdata.database.write(user, "messages", messageCount);
	}
};

exports.messageProcessors = [countWords];