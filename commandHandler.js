var commands = [];

function _findCommandByName(name, element)
{
    return element.name === name;
}

function findCommandByName(name)
{
    return commands.find(_findCommandByName.bind(this, name));
}

module.exports = {
    // Add a command object that can later be called by a user
    addCommand: function (command) {
        commands.push(command);
        console.log("${command.name} command loaded for role ${command.role}");
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

        // Check for role
        if (command.role === "" || message.member.roles.find("name", command.role))
        {
            command.run(message, arguments);
        }
    }
};