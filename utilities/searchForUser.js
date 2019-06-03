exports.searchForUser = (message, userName) => {
	let user;
	
	if (userName.includes('#')) {
		user = message.guild.members.find(m => userName == m.user.tag);
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