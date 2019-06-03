exports.searchForUser = (message, userName) => {
	let user;

	if (userName.includes('#')) {
		user = message.guild.members.find(m => userName === m.user.tag);
	} else {
		user = message.guild.members.find(m => m.user.username === userName );

		if (user == undefined){
			user = message.guild.members.find(m => m.nickname === userName );
		}
	}

	return user;
}