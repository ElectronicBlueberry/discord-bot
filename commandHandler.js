var commands = [];

function compareElementName(name, element)
{
    return element.name === name;
}

function findCommandByName(name)
{
    return commands.find(compareElementName.bind(this, name));
}



module.exports = {
    // Add a command object that can later be called by a user
    addCommand: function (command) {
        commands.push(command);
        console.log(command.name + ' command loaded for "' + command.role + '" role');
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
        if (command.role === "" || message.member.roles.find(compareElementName.bind(this, command.role)))
        {
            command.run(message, arguments);
        }
    }
};