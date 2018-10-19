module.exports = {
	// Searches an array of objects compares its name property
	searchArrayForName: function (array, name) {
		for (let i = 0; i < array.length; i++)
		{
			if (array[i].name === name)
			{
				return array[i];
			}
		}
	},

	searchArray: function (array, compare) {
		for (let i = 0; i < array.length; i++)
		{
			if (array[i] === compare)
			{
				return true;
			}
		}
	},
};