const handler = require("../commandHandler.js");

const testCommand = {
    name: "blub",
    role: "",
    run: (message, arguments) =>
    {
        message.channel.send("blaaaa!");
    }
}

handler.addCommand(testCommand);