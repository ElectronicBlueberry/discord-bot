exports.searchForUser = async (message, userName) => {
	let user;
	let members = await message.guild.fetchMembers();

	let regex = /[^a-zA-Z0-9 #]+/;
	if (userName.includes('#')) {
		let userTag = userName.replace(regex, '');
		user = members.find(m => userTag == m.user.tag.replace(regex, ''));
	}
	
	if (user == undefined) {
		user = members.find(m => m.user.username == userName);
	}

	if (user == undefined){
		user = members.find(m => {return (m.nickname == userName || m.displayName == userName);} );
	}

	if (user == undefined && userName.includes('<@')) {
		let userID = userName.replace(/<@|>/g, '');
		user = members.find(m => m.id == userID);
	}

	return user;
}