const settings = require('require-reload')('./settings.json');
const userdata = require("../../userdata.js");
const db = require("../../database/database.js");
const texts = require('require-reload')('./texts.js');
const config = require("../../config.json");
const util = require("../../utilities/searchForUser.js");

// new database for warnigns without autosaves
var database = new db.Database("warnings");

function none_open(message, id) {
	if (id == -1 || id == undefined) {
		message.channel.send(texts.warning_none_open());
		return true;
	}

	return false;
}

function reset_warning() {
	database.write("global", "current_warning", -1);
	database.write("meta", "vetos", []);
	database.write("meta", "approves", []);
	database.save();
}

function new_warning(message, arg, member) {
	// unsent warning
	let current = database.read("global", "current_warning");

	if (current != -1 && current != undefined) {
		message.channel.send(texts.warning_unsent());
		return;
	}

	// wrong usage
	if (!arg[1]) {
		message.channel.send(texts.warning_new_nouser());
		return;
	}

	// get and increment ID
	let count = database.read("global", "total_warning_count");
	count = ++count || 0;

	database.write("global", "current_warning", ++count || 0);
	database.write("global", "total_warning_count", ++count || 0);

	let author = member.id;
	let target_user = util.searchForUser(message, arg[1]);

	if (target_user == null) {
		message.channel.send(texts.no_user_found(arg[1]));
		return;
	}

	let target = target_user.id;
	let level = parseInt(arg[2] || 1);

	if (isNaN(level)) {
		level = 1;
	}

	database.write("meta", "author", author);
	database.write("meta", "target", target);
	database.write("meta", "level", level);
	database.save();

	message.channel.send(texts.warning_new_sucess(author, target, level));
}

function set_content(message, member) {
	let id = database.read("global", "current_warning");

	if (none_open(message, id)) { return; }

	if (id == database.read("content", "id")) {
		message.channel.send(texts.warning_content_exists());
		return;
	}

	if (member.id != database.read("meta", "author")) {
		message.channel.send(texts.warning_wrong_author(database.read("meta", "author")));
		return;
	}

	database.write("content", "message", message.id);
	database.write("content", "id", id);
	database.save();

	message.channel.send(texts.warning_content_sucess());
}

function set_warning_level(message, target_level) {
	if (none_open(message, database.read("global", "current_warning"))) { return; }

	let level = parseInt(target_level);

	if (isNaN(level)) {
		level = 1;
	}

	database.write("meta", "level", level);
	database.save();

	message.channel.send(texts.warning_setlevel(level));
}

function cancel_warning(message) {
	if (none_open(message, database.read("global", "current_warning"))) { return; }

	reset_warning();

	message.channel.send(texts.warning_cancel());
}

function decline_warning(message, member) {
	if (none_open(message, database.read("global", "current_warning"))) { return; }

	let vetos = database.read("meta", "vetos");
	let approves = database.read("meta", "approves");
	
	if (vetos == undefined) {
		vetos = [];
	}

	if (approves == undefined) {
		approves = [];
	}

	// Remove Approve
	let approveIndex = approves.indexOf(member.id);
	if (approveIndex != -1) {
		approves.splice(approveIndex, 1);
		database.write("meta", "approves", approves);
	}

	let vetoIndex = vetos.indexOf(member.id)
	if (vetoIndex != -1) {
		message.channel.send(texts.warning_declined_allready(member));
		return;
	}

	vetos.push(member.id);

	database.write("meta", "vetos", vetos);
	database.save();

	message.channel.send(texts.warning_declined(member));
}

function approve_warning(message, member) {
	if (none_open(message, database.read("global", "current_warning"))) { return; }

	let approves = database.read("meta", "approves");
	let vetos = database.read("meta", "vetos");

	if (vetos == undefined) {
		vetos = [];
	}

	if (approves == undefined) {
		approves = [];
	}

	// Remove Veto
	let vetoIndex = vetos.indexOf(member.id);
	if (vetoIndex != -1) {
		vetos.splice(vetoIndex, 1);
		database.write("meta", "vetos", vetos);
	}

	let approveIndex = approves.indexOf(member.id);
	if (approveIndex != -1) {
		message.channel.send(texts.warning_approved_allready(member));
		return;
	}

	approves.push(member.id);

	database.write("meta", "approves", approves);
	database.save();

	message.channel.send(texts.warning_approved(member));
}

async function attempt_warning_send(message) {
	let vetos = database.read("meta", "vetos");
	let approves = database.read("meta", "approves");

	if (vetos == undefined) {
		vetos = [];
	}

	if (approves == undefined) {
		approves = [];
	}

	if (none_open(message, database.read("global", "current_warning"))) { return; }

	if (approves.length < settings.warning_approve_count) {
		message.channel.send(texts.warning_insufficent_approves(approves.length));
		return;
	}
	
	if (vetos.length != 0) {
		message.channel.send(texts.warning_vetoed(vetos));
		return;
	}

	let content = await send_warning_to(message, database.read("meta", "target"));

	if (content != null) {
		message.channel.send(texts.warning_sent());
		
		let level = database.read("meta", "level");
		let target = database.read("meta", "target");
		let current_level = level_increase(target, parseInt(level));
		
		userdata.client.channels.find(c => (c.name == settings.archive_channel)).send(texts.warning_archive(
			database.read("meta", "author"),
			target,
			content,
			approves,
			level,
			current_level
		));

		reset_warning();
	}
}

async function send_warning_to(message, target) {
	let content_id = database.read("content", "id");
	let id = database.read("global", "current_warning");

	if (content_id != id) {
		message.channel.send(texts.warning_no_content());
		return null;
	}

	let message_id = database.read("content", "message");
	let msg = await message.channel.fetchMessage(message_id);
	let content = msg.content;
	content = content.replace(`${config.prefix}${settings.command_warning} ${settings.command_warning_content} `,'');

	let member = await userdata.client.fetchUser(target);
	member.send(texts.warning_message(content));

	return content;
}

function level_increase(target, value) {
	let level = level_get(target) || 0;
	level += value;

	userdata.database.write(target, "warnlevel", level);
	userdata.database.save();
	return level;
}

function level_reset(target) {
	userdata.database.write(target, "warnlevel", 0);
	userdata.database.save();
}

function level_get(target) {
	return userdata.database.read(target, "warnlevel");
}

var warning = {
	name: settings.command_warning,
	role: settings.role,
	run: (message, arg, member) => {
		if (arg.length === 0 || arg[0] == settings.command_help) {
			message.channel.send(texts.warning_help());
			return;
		}

		switch (arg[0]) {
			case settings.command_warning_new:
				new_warning(message, arg, member);
				break;

			case settings.command_warning_content:
				set_content(message, member);
				break;
			
			case settings.command_warning_cancel:
				cancel_warning(message);
				break;

			case settings.command_warning_decline:
				decline_warning(message, member);
				break;

			case settings.command_warning_approve:
				approve_warning(message, member);
				break;

			case settings.command_warning_preview:
				send_warning_to(message, member.id);
				break;

			case settings.command_warning_send:
				attempt_warning_send(message);
				break;
		
			case settings.command_warning_setlevel:
				set_warning_level(message, arg[1]);
				break;
		}
	}
};

var level = {
	name: settings.command_level,
	role: settings.role,
	run: (message, arg, member) => {

		if (!arg[0]) {
			message.channel.send(texts.level_help());
			return;
		}

		let username;
		if (!arg[1]) {
			username = arg[0];
		} else {
			username = arg[1];
		}

		let target_user = util.searchForUser(message, username);

		if (target_user == null) {
			message.channel.send(texts.no_user_found(username));
			message.channel.send(texts.level_nouser());
			return;
		}

		let target = target_user.id;

		let archive = userdata.client.channels.find(c => (c.name == settings.archive_channel));
		let old_lvl = level_get(target) || 0;

		switch (arg[0]) {
			case settings.command_level_reset:
				level_reset(target);
				message.channel.send(texts.level_reset(target));
				archive.send(texts.level_archive_reset(member.id, target, old_lvl));
				break;

			case settings.command_level_add:
				let level = parseInt(arg[2] || 1);
				if (isNaN(level)) {
					level = 1;
				}
				level = level_increase(target, level);
				message.channel.send(texts.level_increase(target, level));
				archive.send(texts.level_archive_increase(member.id, target, old_lvl, level));
				break;

			default:
				message.channel.send(texts.level_get(target, old_lvl));
				break;
		}
	}
};

module.exports = {
	channelCommands: [warning, level]
}