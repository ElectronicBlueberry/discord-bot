exports.searchForUser = async (message, userName) => {
	let user;
	let memberguild = await message.guild.fetchMembers();
	let members = memberguild.members;

	let regex = /[^a-zA-Z0-9 #]+/;
	if (userName.includes('#')) {
		let userTag = userName.replace(regex, '');
		user = members.find(m => userTag === m.user.tag.replace(regex, '').toLowerCase());
	}
	
	if (user == undefined) {
		user = members.find(m => m.user.username.toLowerCase() === userName);
	}

	if (user == undefined){
		user = members.find(m => {
			if (m.nickname && m.nickname.toLowerCase() === userName) return true;
			if (m.displayName && m.displayName.toLowerCase() === userName) return true;
		});
	}

	if (user == undefined && userName.includes('<@')) {
		let userID = userName.replace(/<@|>/g, '');
		user = members.find(m => m.id.toLowerCase() === userID);
	}

	return user;
}