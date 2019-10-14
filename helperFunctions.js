exports.getIdByName = (collection, name) => {
	return collection.find(e => e.name === name).id;
};

exports.getRoleByName = (collection, name) => {
	let role = this.getIdByName(collection, name);

	if (role === null) {
		console.log("WARINING!");
		console.log(`Role "${command.role}" not found!`);

		return null;
	}

	return role;
};