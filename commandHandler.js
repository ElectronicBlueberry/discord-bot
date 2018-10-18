const helper = require("./helperFunctions.js");

function findCommandByName(commandArray, name)
{
    return helper.searchArrayForName(commandArray, name);
}

module.exports = {
    // Add a command object that can later be called by a user
    addCommand: function (commandArray, command) {
        commandArray.push(command);
        console.log('"' + command.name + '" command loaded for "' + command.role + '" role');
    },

    hasPrefix: function (message, prefix)
    {
        return message.content.substring(0, prefix.length) === prefix;
    },

    // Searches for a command in given array and runs it
    runCommand: function (commandArray, message, prefix)
    {
        let arguments = message.content.substr(prefix.length).split(" ");   // remove prefix and split
        let name = arguments.shift();    // get command name

        let command = findCommandByName(commandArray, name);

        if (command == undefined)
        {
            return;
        }

        // Check for role
        if (command.role === "" || helper.searchMapForName(message.member.roles, command.role) )
        {
            command.run(message, arguments);
        }
    },

    channelCommands: [],
    dmCommands: []
};