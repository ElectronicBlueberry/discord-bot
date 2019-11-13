const settings = require('require-reload')('./settings.json');

// Builda A String to send to users of a set of roles
function build_role_string(array)
{
	let message = "";
	let set = [];

	for (let i = 0; i < array.length; i++)
	{
		if (set.includes( array[i].role)) continue;
		set.push(array[i].role);
		message += "\n";
		message += array[i].role;
	}

	return message;
}

// Finds a role by its name in the settings
function find_role(name, topic)
{
	let role_obj = topic.roles.find(e => {
		return e.name.toLowerCase() === name.replace(/[.,]/g, '');
	});

	return role_obj;
}

// attempts to find a role on the server and set it. 0 = failed, 1 = sucess
function add_role(message, role_name, topic)
{
	let role_obj = find_role(role_name, topic);
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

function build_response_string(message, roles) {
	return message.replace(/ROLES/gm, `${build_role_string(roles)}`);
}

function set_role(message, arguments, topic) {
	// Roles that were set with this command
	let set_roles = [];

	for (const role_name of arguments) {
		let role_obj = add_role(message, role_name, topic);

		if (role_obj !== null) {
			set_roles.push(role_obj);
		}
	}

	// None of the provided roles were sucessfully set
	if (arguments.length !== 0 && set_roles.length === 0) {
		message.channel.send( build_response_string(topic.wrong_arguments, topic.roles));
		return;
	}

	let remove_count = 0;

	// Clear all other roles
	for (const role_obj of topic.roles) {
		if (!set_roles.find(v => v.role === role_obj.role)) {
			remove_count += removeRole(message, role_obj.role);
		}
	}

	if (remove_count === 0 && arguments.length === 0) {
		message.channel.send( build_response_string(topic.wrong_arguments, topic.roles));
	} else if (set_roles.length !== 0) {
		message.channel.send( build_response_string(topic.role_set_message, set_roles));
	} else {
		message.channel.send( build_response_string(topic.role_cleared_message, topic.roles));
	}
}

var commands = [];

settings.topics.forEach((t) => {
	commands.push(
		{
			name: t.role_command,
			role: t.role,
			run: (msg, args) => {
				set_role(msg, args, t);
			}
		}
	);
});

module.exports = {
	channelCommands: commands
};