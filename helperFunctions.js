exports.getIdByName = (collection, name) => {
	return collection.find(e => e.name === name).id;
};