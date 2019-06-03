exports.searchForUser = (message, userName) => {
	let user;
	
	let regex = /[^a-zA-Z0-9 #]+/;
	if (userName.includes('#')) {
		let userTag = userName.replace(regex, '');
		user = message.guild.members.find(m => userTag == m.user.tag.replace(regex, ''));
	}
	
	if (user == undefined) {
		user = message.guild.members.find(m => m.user.username == userName);
	}

	if (user == undefined){
		user = message.guild.members.find(m => {return (m.nickname == userName || m.displayName == userName);} );
	}

	if (user == undefined && userName.includes('<@')) {
		let userID = userName.replace(/<@|>/g, '');
		user = message.guild.members.find(m => m.id == userID);
	}

	return user;
}