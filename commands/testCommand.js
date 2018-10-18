const handler = require("../commandHandler.js");

handler.addCommand( handler.channelCommands, {
    name: "blub",
    role: "",
    run: (message, arguments) =>
    {
        message.channel.send("blaaaa!");
    }
});

handler.addCommand( handler.channelCommands, {
    name: "add",
    role: "mathematician",
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