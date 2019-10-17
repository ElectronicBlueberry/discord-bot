const settings = require('require-reload')('./settings.json');

// Builda A String to send to users of a set of roles
function buildRoleString(array)
{
	var message = "";

	for (let i = 0; i < array.length; i++)
	{
		message += "\n";
		message += array[i].name;
	}

	return message;
}

// Finds a role by its name in the settings
function find_role(name)
{
	let role_obj = settings.roles.find(e => {
		return e.name === name;
	});

	return role_obj;
}

// attempts to find a role on the server and set it. 0 = failed, 1 = sucess
function addRole(message, role_name)
{
	let role_obj = find_role(role_name);
	if (role_obj == undefined) {
		return null;
	}

	let role = message.guild.roles.find(r => r.name === role_obj.role);

	if (role == undefined) {
		return null;
	}

	message.member.addRole(role);
	return role_obj;
}

// attempts to remvoe a user Role
function removeRole(message, role_name)
{
	let role = message.member.roles.find(r => r.name === role_name);
	if (role == undefined) {
		return 0;
	}

	message.member.removeRole(role);
	return 1;
}

var set_role = {
	name: settings.role_command,
	role: settings.role,
	run: (message, arguments) => {
		// Roles that were set with this command
		let set_roles = [];

		for (const role_name of arguments) {
			let role_obj = addRole(message, role_name);

			if (role_obj !== null) {
				set_roles.push(role_obj);
			}
		}

		// None of the provided roles were sucessfully set
		if (arguments.length !== 0 && set_roles.length === 0) {
			message.channel.send(settings.wrong_arguments + buildRoleString(settings.roles));
			return;
		}

		let remove_count = 0;

		// Clear all other roles
		for (const role_obj of settings.roles) {
			if (!set_roles.includes(role_obj)) {
				remove_count += removeRole(message, role_obj.role);
			}
		}

		if (remove_count === 0 && arguments.length === 0) {
			message.channel.send(settings.wrong_arguments + buildRoleString(settings.roles));
		} else if (set_roles.length !== 0) {
			message.channel.send(settings.role_set_message + buildRoleString(set_roles));
		} else {
			message.channel.send(settings.role_cleared_message);
		}
	}
};

module.exports = {
	channelCommands: [set_role]
};