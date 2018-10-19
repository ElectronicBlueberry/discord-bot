const handler = require("../commandHandler.js");

handler.addMessageProcessor( handler.messageProcessors, {
    name: 'haha',
    log: 'responds to everything with "haha"',
    whitelist: ["general"],
    blacklist: ["test-2"],
    run: function (message) {
        message.channel.send("haha");
    }
});