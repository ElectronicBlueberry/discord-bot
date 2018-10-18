const helper = require("./helperFunctions.js");
var commands = [];

function findCommandByName(name)
{
    return helper.searchArrayForName(commands, name);
}

module.exports = {
    // Add a command object that can later be called by a user
    addCommand: function (command) {
        commands.push(command);
        console.log('"' + command.name + '" command loaded for "' + command.role + '" role');
    },

    isCommand: function (message, prefix)
    {
        return message.content.charAt(0) === prefix;
    },

    // Searches for a command and runs it
    runCommand: function (message)
    {
        let arguments = message.content.substr(1).split(" ");   // remove prefix and split
        let name = arguments.shift();    // get command name

        let command = findCommandByName(name);

        if (command == undefined)
        {
            return;
        }

        // Check for role
        if (command.role === "" || helper.searchMapForName(message.member.roles, command.role) )
        {
            command.run(message, arguments);
        }
    }
};