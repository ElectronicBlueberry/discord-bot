const userdata = require("../../userdata.js");

let countWords = {
	name: "Wort Counter",
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